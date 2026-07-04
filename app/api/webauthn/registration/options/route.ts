import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { getCurrentGuestId } from "@/lib/portal";
import { RP_NAME, getRpId, setWebauthnChallenge } from "@/lib/webauthn";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST() {
  const allowed = await checkRateLimit("webauthn-registration-options", 20, 60_000);

  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }

  const guestId = await getCurrentGuestId();

  if (!guestId) {
    return NextResponse.json({ error: "You must be signed in to add a passkey." }, { status: 401 });
  }

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { credentials: true },
  });

  if (!guest) {
    return NextResponse.json({ error: "You must be signed in to add a passkey." }, { status: 401 });
  }

  const rpID = await getRpId();

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID,
    userID: new TextEncoder().encode(guest.id),
    userName: guest.email,
    userDisplayName: `${guest.firstName} ${guest.lastName}`,
    attestationType: "none",
    excludeCredentials: guest.credentials.map((credential) => ({
      id: credential.credentialId,
      transports: credential.transports
        ? (JSON.parse(credential.transports) as AuthenticatorTransportFuture[])
        : undefined,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      // Guests are registering Face ID/Touch ID/Windows Hello, not a
      // physical security key — restricting to "platform" here skips the
      // QR-code/security-key choice screen and goes straight to the
      // on-device biometric prompt.
      authenticatorAttachment: "platform",
    },
  });

  await setWebauthnChallenge(options.challenge);

  return NextResponse.json(options);
}
