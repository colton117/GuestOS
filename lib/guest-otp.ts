import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const CODE_LENGTH = 6;
const CODE_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

export class LoginCodeCooldownError extends Error {
  override name = "LoginCodeCooldownError";

  constructor(public readonly retryAfterSeconds: number) {
    super(`Please wait ${retryAfterSeconds}s before requesting another code.`);
  }
}

function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(CODE_LENGTH, "0");
}

function hashCode(code: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${code}`).digest("hex");
}

function timingSafeStringsEqual(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

/**
 * Generates a fresh 6-digit sign-in code for a guest. Deletes any prior
 * unconsumed codes first so only the most recently issued one can ever
 * succeed — otherwise an attacker who triggers several sends could try
 * each one. Throws LoginCodeCooldownError if a code (for any reason —
 * initial send or resend) went out less than a minute ago, so nothing can
 * spam a guest's inbox by hammering either lookup or resend.
 */
export async function createGuestLoginCode(guestId: string): Promise<string> {
  const mostRecent = await prisma.guestLoginCode.findFirst({
    where: { guestId },
    orderBy: { createdAt: "desc" },
  });

  if (mostRecent) {
    const elapsedMs = Date.now() - mostRecent.createdAt.getTime();

    if (elapsedMs < RESEND_COOLDOWN_MS) {
      throw new LoginCodeCooldownError(Math.ceil((RESEND_COOLDOWN_MS - elapsedMs) / 1000));
    }
  }

  const code = generateCode();
  const salt = randomBytes(16).toString("hex");

  await prisma.$transaction([
    prisma.guestLoginCode.deleteMany({ where: { guestId, consumedAt: null } }),
    prisma.guestLoginCode.create({
      data: {
        guestId,
        codeHash: hashCode(code, salt),
        salt,
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    }),
  ]);

  return code;
}

export type VerifyGuestLoginCodeResult =
  | "valid"
  | "invalid"
  | "expired"
  | "too_many_attempts";

/**
 * Verifies a submitted code against the guest's latest unconsumed code.
 * Locks the code out after MAX_ATTEMPTS wrong guesses, forcing a fresh
 * code request rather than allowing unlimited brute force against the
 * same 6-digit value.
 */
export async function verifyGuestLoginCode(
  guestId: string,
  submittedCode: string,
): Promise<VerifyGuestLoginCodeResult> {
  const record = await prisma.guestLoginCode.findFirst({
    where: { guestId, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return "invalid";
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return "too_many_attempts";
  }

  if (record.expiresAt < new Date()) {
    return "expired";
  }

  const matches = timingSafeStringsEqual(
    hashCode(submittedCode.trim(), record.salt),
    record.codeHash,
  );

  if (!matches) {
    await prisma.guestLoginCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return "invalid";
  }

  await prisma.guestLoginCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });

  return "valid";
}
