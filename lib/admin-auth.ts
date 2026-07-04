import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "guestos_admin_session";
export const SUPERADMIN_SESSION_COOKIE = "guestos_superadmin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

function timingSafeStringsEqual(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not configured. Set it in your environment to enable admin login.",
    );
  }

  return secret;
}

// Superadmin sessions reuse the same signing secret as the host tier. They're
// two independent cookies signed with the same HMAC key — simpler to operate
// (one secret to provision) without weakening either tier, since the cookie
// name/value pair is what's being verified, not the secret alone.
function getSuperadminSessionSecret(): string {
  return process.env.SUPERADMIN_SESSION_SECRET || getSessionSecret();
}

function sign(expiresAt: number, secret: string): string {
  return createHmac("sha256", secret).update(String(expiresAt)).digest("hex");
}

function isValidSession(expiresAt: number, signature: string, secret: string): boolean {
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  return timingSafeStringsEqual(sign(expiresAt, secret), signature);
}

export function verifyAdminPassword(password: string): boolean {
  const configured = process.env.ADMIN_PASSWORD;

  if (!configured) {
    throw new Error(
      "ADMIN_PASSWORD is not configured. Set it in your environment to enable admin login.",
    );
  }

  return timingSafeStringsEqual(configured, password);
}

export function verifySuperadminPassword(password: string): boolean {
  const configured = process.env.SUPERADMIN_PASSWORD;

  if (!configured) {
    throw new Error(
      "SUPERADMIN_PASSWORD is not configured. Set it in your environment to enable superadmin login.",
    );
  }

  return timingSafeStringsEqual(configured, password);
}

export async function createAdminSession() {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, `${expiresAt}.${sign(expiresAt, getSessionSecret())}`, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function createSuperadminSession() {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const cookieStore = await cookies();

  cookieStore.set(
    SUPERADMIN_SESSION_COOKIE,
    `${expiresAt}.${sign(expiresAt, getSuperadminSessionSecret())}`,
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS / 1000,
    },
  );
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function clearSuperadminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SUPERADMIN_SESSION_COOKIE);
}

export async function hasAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!value) {
    return false;
  }

  const [expiresAtRaw, signature] = value.split(".");

  if (!signature) {
    return false;
  }

  return isValidSession(Number(expiresAtRaw), signature, getSessionSecret());
}

export async function hasSuperadminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SUPERADMIN_SESSION_COOKIE)?.value;

  if (!value) {
    return false;
  }

  const [expiresAtRaw, signature] = value.split(".");

  if (!signature) {
    return false;
  }

  return isValidSession(Number(expiresAtRaw), signature, getSuperadminSessionSecret());
}

/**
 * Guards both host-tier pages and their Server Actions. Page-level middleware
 * alone wouldn't stop a direct call to a host Server Action, so this must
 * be called at the top of every host page AND every host Server Action.
 */
export async function requireAdminSession(nextPath?: string) {
  const authorized = await hasAdminSession();

  if (!authorized) {
    const query = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/admin-login${query}`);
  }
}

/**
 * Guards both superadmin (operator) pages and their Server Actions, following
 * the exact same pattern as requireAdminSession — the action itself must
 * check, not just the page.
 */
export async function requireSuperadminSession(nextPath?: string) {
  const authorized = await hasSuperadminSession();

  if (!authorized) {
    const query = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/superadmin-login${query}`);
  }
}
