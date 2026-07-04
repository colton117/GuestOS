import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentGuestId } from "@/lib/portal";
import { consumeWebauthnChallenge, getOrigin, getRpId } from "@/lib/webauthn";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_DEVICE_LABEL_LENGTH = 60;

export async function POST(request: Request) {
  const allowed = await checkRateLimit("webauthn-registration-verify", 20, 60_000);

  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }

  const guestId = await getCurrentGuestId();

  if (!guestId) {
    return NextResponse.json({ error: "You must be signed in to add a passkey." }, { status: 401 });
  }

  const expectedChallenge = await consumeWebauthnChallenge();

  if (!expectedChallenge) {
    return NextResponse.json(
      { error: "That passkey request expired. Please try again." },
      { status: 400 },
    );
  }

  const body = (await request.json()) as {
    response?: RegistrationResponseJSON;
    deviceLabel?: string;
  };

  if (!body.response) {
    return NextResponse.json({ error: "Invalid passkey response." }, { status: 400 });
  }

  const rpID = await getRpId();
  const origin = await getOrigin();

  let verification;

  try {
    verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (error) {
    console.error("[GuestOS WebAuthn] Registration verification failed.", error);
    return NextResponse.json({ error: "Could not verify that passkey." }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Could not verify that passkey." }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;
  const deviceLabel = body.deviceLabel?.trim().slice(0, MAX_DEVICE_LABEL_LENGTH) || null;

  try {
    await prisma.guestCredential.create({
      data: {
        guestId,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports ? JSON.stringify(credential.transports) : null,
        deviceLabel,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That passkey is already registered." }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({ verified: true });
}
