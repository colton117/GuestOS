import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { getRpId, setWebauthnChallenge } from "@/lib/webauthn";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST() {
  const allowed = await checkRateLimit("webauthn-authentication-options", 20, 60_000);

  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }

  const rpID = await getRpId();

  // No allowCredentials: the browser prompts with any discoverable passkey
  // registered for this RP, so the guest never has to type an identifier.
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
  });

  await setWebauthnChallenge(options.challenge);

  return NextResponse.json(options);
}
