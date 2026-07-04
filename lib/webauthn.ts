import { cookies, headers } from "next/headers";

export const RP_NAME = "GuestOS";
export const WEBAUTHN_CHALLENGE_COOKIE = "guestos_webauthn_challenge";
const CHALLENGE_MAX_AGE_SECONDS = 300;

/**
 * Derived from the request host rather than a fixed env var so the same
 * build works across localhost dev and the production domain. Set
 * WEBAUTHN_RP_ID/WEBAUTHN_ORIGIN to override if the app ever sits behind a
 * proxy that obscures the real host.
 */
export async function getRpId(): Promise<string> {
  if (process.env.WEBAUTHN_RP_ID) {
    return process.env.WEBAUTHN_RP_ID;
  }

  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost";
  return host.split(":")[0];
}

export async function getOrigin(): Promise<string> {
  if (process.env.WEBAUTHN_ORIGIN) {
    return process.env.WEBAUTHN_ORIGIN;
  }

  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const proto =
    headerStore.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function setWebauthnChallenge(challenge: string) {
  const cookieStore = await cookies();
  cookieStore.set(WEBAUTHN_CHALLENGE_COOKIE, challenge, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: CHALLENGE_MAX_AGE_SECONDS,
  });
}

/**
 * Reads and clears the pending challenge in one step so a given challenge
 * can only ever be redeemed once, mirroring a real WebAuthn ceremony.
 */
export async function consumeWebauthnChallenge(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(WEBAUTHN_CHALLENGE_COOKIE)?.value ?? null;
  cookieStore.delete(WEBAUTHN_CHALLENGE_COOKIE);
  return value;
}
