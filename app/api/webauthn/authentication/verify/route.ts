import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON, AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { getGuestPortalDestination, signInGuest } from "@/lib/portal";
import { consumeWebauthnChallenge, getOrigin, getRpId } from "@/lib/webauthn";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const allowed = await checkRateLimit("webauthn-authentication-verify", 20, 60_000);

  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }

  const expectedChallenge = await consumeWebauthnChallenge();

  if (!expectedChallenge) {
    return NextResponse.json(
      { error: "That sign-in request expired. Please try again." },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { response?: AuthenticationResponseJSON };

  if (!body.response) {
    return NextResponse.json({ error: "Invalid passkey response." }, { status: 400 });
  }

  const storedCredential = await prisma.guestCredential.findUnique({
    where: { credentialId: body.response.id },
  });

  if (!storedCredential) {
    return NextResponse.json({ error: "That passkey isn't recognized." }, { status: 401 });
  }

  const rpID = await getRpId();
  const origin = await getOrigin();

  let verification;

  try {
    verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: storedCredential.credentialId,
        publicKey: new Uint8Array(storedCredential.publicKey),
        counter: storedCredential.counter,
        transports: storedCredential.transports
          ? (JSON.parse(storedCredential.transports) as AuthenticatorTransportFuture[])
          : undefined,
      },
    });
  } catch (error) {
    console.error("[GuestOS WebAuthn] Authentication verification failed.", error);
    return NextResponse.json({ error: "Could not verify that passkey." }, { status: 400 });
  }

  if (!verification.verified) {
    return NextResponse.json({ error: "Could not verify that passkey." }, { status: 401 });
  }

  await prisma.guestCredential.update({
    where: { id: storedCredential.id },
    data: {
      counter: verification.authenticationInfo.newCounter,
      lastUsedAt: new Date(),
    },
  });

  await signInGuest(storedCredential.guestId, true);

  // A passkey proves identity just as strongly as the email code does, but
  // it must still respect the same recurring SMS opt-in prompt the email
  // path enforces on every login until a guest grants it — otherwise
  // passkey sign-in would be a silent bypass of that flow.
  const guest = await prisma.guest.findUnique({
    where: { id: storedCredential.guestId },
    select: { smsOptIn: true },
  });

  const destination = guest && !guest.smsOptIn
    ? `/login?smsOptInPending=${encodeURIComponent(storedCredential.guestId)}&remember=1`
    : await getGuestPortalDestination(storedCredential.guestId);

  return NextResponse.json({ verified: true, destination });
}
