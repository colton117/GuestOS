"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  findGuestByIdentifier,
  getGuestPortalDestination,
  getCurrentGuestId,
  isValidGuestEmail,
  isValidGuestPhone,
  normalizeGuestEmail,
  normalizeGuestPhone,
  PORTAL_GUEST_COOKIE,
  requireCurrentGuest,
  signInGuest,
} from "@/lib/portal";
import { requireAdminSession } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity-log";
import { logSystemEvent } from "@/lib/system-log";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  createGuestLoginCode,
  LoginCodeCooldownError,
  verifyGuestLoginCode,
} from "@/lib/guest-otp";
import { sendGuestLoginCodeEmail } from "@/lib/email/resend";

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

const MIN_VEHICLE_YEAR = 1900;

function parseVehicleYear(value: FormDataEntryValue | null): number {
  const parsed = Number(value);
  const currentYear = new Date().getFullYear();

  if (!Number.isFinite(parsed) || parsed < MIN_VEHICLE_YEAR || parsed > currentYear + 1) {
    return currentYear;
  }

  return parsed;
}

async function syncVehicleDefaults(guestId: string, vehicleId: string) {
  await prisma.vehicle.updateMany({
    where: { guestId, NOT: { id: vehicleId } },
    data: { isDefault: false },
  });

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { isDefault: true },
  });
}

/**
 * Looks up a guest by the email or phone they entered. If found, emails them
 * a one-time sign-in code rather than signing them in outright — a plain
 * identifier match proves nothing about who's actually typing it in, and
 * this app can unlock physical doors, so we don't sign anyone in without
 * proof they control the email on file. If not found, sends them to the
 * create-account step, prefilled with whatever they typed.
 */
export async function lookupGuestAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();

  if (!identifier) {
    redirect("/login");
  }

  const allowed = await checkRateLimit("guest-lookup", 20, 60_000);

  if (!allowed) {
    redirect(
      `/login?identifier=${encodeURIComponent(identifier)}&error=${encodeURIComponent(
        "Too many attempts. Please wait a minute and try again.",
      )}`,
    );
  }

  const guest = await findGuestByIdentifier(identifier);

  if (!guest) {
    redirect(`/login?identifier=${encodeURIComponent(identifier)}`);
  }

  try {
    const code = await createGuestLoginCode(guest.id);
    await sendGuestLoginCodeEmail(guest.email, code);
  } catch (error) {
    if (error instanceof LoginCodeCooldownError) {
      // A code already went out within the last minute — it's presumably
      // still sitting in their inbox, so just take them to the entry
      // screen instead of pretending nothing was sent.
      redirect(`/login?otpPending=${encodeURIComponent(guest.id)}`);
    }

    console.error("[GuestOS] Failed to send guest sign-in code.", error);
    redirect(
      `/login?error=${encodeURIComponent(
        "We couldn't send a sign-in code right now. Please try again in a moment.",
      )}`,
    );
  }

  redirect(`/login?otpPending=${encodeURIComponent(guest.id)}`);
}

/**
 * Verifies the code sent by lookupGuestAction. Only after this succeeds do
 * we actually establish a session — this is the step that proves the person
 * signing in controls the guest's email, not just knows it.
 */
export async function verifyLoginCodeAction(formData: FormData) {
  const guestId = String(formData.get("guestId") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!guestId) {
    redirect("/login");
  }

  const allowed = await checkRateLimit("guest-otp-verify", 15, 60_000);

  if (!allowed) {
    redirect(
      `/login?otpPending=${encodeURIComponent(guestId)}&error=${encodeURIComponent(
        "Too many attempts. Please wait a minute and try again.",
      )}`,
    );
  }

  const result = await verifyGuestLoginCode(guestId, code);

  if (result === "too_many_attempts") {
    redirect(
      `/login?otpPending=${encodeURIComponent(guestId)}&error=${encodeURIComponent(
        "Too many incorrect attempts. Request a new code to try again.",
      )}`,
    );
  }

  if (result === "expired") {
    redirect(
      `/login?otpPending=${encodeURIComponent(guestId)}&error=${encodeURIComponent(
        "That code expired. Request a new one.",
      )}`,
    );
  }

  if (result === "invalid") {
    redirect(
      `/login?otpPending=${encodeURIComponent(guestId)}&error=${encodeURIComponent(
        "That code isn't right. Double check your email and try again.",
      )}`,
    );
  }

  const guest = await prisma.guest.findUnique({ where: { id: guestId } });

  if (!guest) {
    redirect("/login");
  }

  if (!guest.smsOptIn) {
    redirect(`/login?smsOptInPending=${encodeURIComponent(guest.id)}`);
  }

  await signInGuest(guest.id);

  const destination = await getGuestPortalDestination(guest.id);
  redirect(destination);
}

/**
 * Issues a fresh code for the same guest, e.g. if the first one expired or
 * never arrived. Separately rate-limited and tighter than lookup/verify
 * since this is the action most likely to be abused to spam someone's inbox.
 */
export async function resendLoginCodeAction(formData: FormData) {
  const guestId = String(formData.get("guestId") ?? "").trim();

  if (!guestId) {
    redirect("/login");
  }

  const allowed = await checkRateLimit("guest-otp-resend", 5, 60_000);

  if (!allowed) {
    redirect(
      `/login?otpPending=${encodeURIComponent(guestId)}&error=${encodeURIComponent(
        "Please wait a bit before requesting another code.",
      )}`,
    );
  }

  const guest = await prisma.guest.findUnique({ where: { id: guestId } });

  if (!guest) {
    redirect("/login");
  }

  try {
    const code = await createGuestLoginCode(guest.id);
    await sendGuestLoginCodeEmail(guest.email, code);
  } catch (error) {
    if (error instanceof LoginCodeCooldownError) {
      redirect(
        `/login?otpPending=${encodeURIComponent(guestId)}&error=${encodeURIComponent(
          `Please wait ${error.retryAfterSeconds}s before requesting another code.`,
        )}`,
      );
    }

    console.error("[GuestOS] Failed to resend guest sign-in code.", error);
    redirect(
      `/login?otpPending=${encodeURIComponent(guestId)}&error=${encodeURIComponent(
        "We couldn't send a new code right now. Please try again in a moment.",
      )}`,
    );
  }

  redirect(`/login?otpPending=${encodeURIComponent(guestId)}&sent=1`);
}

/**
 * Completes the recurring SMS opt-in re-prompt shown to returning guests who
 * haven't opted in yet. Unlike the signup checkbox, this one is optional —
 * leaving it unchecked just means we ask again next time.
 */
export async function confirmSmsOptInAction(formData: FormData) {
  const guestId = String(formData.get("guestId") ?? "").trim();
  const smsOptIn = parseBoolean(formData.get("smsConsent"));

  if (!guestId) {
    redirect("/login");
  }

  const guest = await prisma.guest.findUnique({ where: { id: guestId } });

  if (!guest) {
    redirect("/login");
  }

  if (smsOptIn && !guest.smsOptIn) {
    await prisma.guest.update({
      where: { id: guestId },
      data: { smsOptIn: true },
    });
  }

  await signInGuest(guestId);

  const destination = await getGuestPortalDestination(guestId);
  redirect(destination);
}

export async function createGuestAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const smsOptIn = Boolean(formData.get("smsConsent"));

  if (!firstName || !lastName || !email || !phone) {
    redirect(
      `/login?identifier=${encodeURIComponent(identifier)}&error=${encodeURIComponent(
        "Please fill in every field.",
      )}`,
    );
  }

  const normalizedEmail = normalizeGuestEmail(email);
  const normalizedPhone = normalizeGuestPhone(phone);

  if (!isValidGuestEmail(normalizedEmail)) {
    redirect(
      `/login?identifier=${encodeURIComponent(identifier)}&error=${encodeURIComponent(
        "Please enter a valid email address.",
      )}`,
    );
  }

  if (!isValidGuestPhone(normalizedPhone)) {
    redirect(
      `/login?identifier=${encodeURIComponent(identifier)}&error=${encodeURIComponent(
        "Please enter a valid phone number (at least 10 digits).",
      )}`,
    );
  }

  const allowed = await checkRateLimit("guest-create", 10, 60_000);

  if (!allowed) {
    redirect(
      `/login?identifier=${encodeURIComponent(identifier)}&error=${encodeURIComponent(
        "Too many attempts. Please wait a minute and try again.",
      )}`,
    );
  }

  let guestId: string;

  try {
    const guest = await prisma.guest.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,
        phone: normalizedPhone,
        smsOptIn,
      },
    });
    guestId = guest.id;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect(
        `/login?identifier=${encodeURIComponent(identifier)}&error=${encodeURIComponent(
          "That email or phone is already registered. Try looking it up instead.",
        )}`,
      );
    }
    throw error;
  }

  await signInGuest(guestId);
  redirect(`/login?passkeySetupPending=1&destination=${encodeURIComponent("/request-visit")}`);
}

export async function clearGuestAction() {
  const cookieStore = await cookies();
  cookieStore.delete(PORTAL_GUEST_COOKIE);
  redirect("/login");
}

export async function updateProfileAction(formData: FormData) {
  const guest = await requireCurrentGuest();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = normalizeGuestEmail(String(formData.get("email") ?? ""));
  const phone = normalizeGuestPhone(String(formData.get("phone") ?? ""));

  if (!firstName || !lastName || !isValidGuestEmail(email) || !isValidGuestPhone(phone)) {
    redirect("/profile?error=invalid");
  }

  await prisma.guest.update({
    where: { id: guest.id },
    data: {
      firstName,
      lastName,
      email,
      phone,
    },
  });

  await logActivity(guest.id, "Updated profile details");

  revalidatePath("/current-visit");
  revalidatePath("/profile");
  revalidatePath("/vehicles");
  revalidatePath("/visits");
  revalidatePath("/request-visit");
}

export async function addVehicleAction(formData: FormData) {
  const guest = await requireCurrentGuest();
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const year = parseVehicleYear(formData.get("year"));
  const color = String(formData.get("color") ?? "").trim();
  const plate = String(formData.get("plate") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const isDefault = parseBoolean(formData.get("isDefault"));

  const created = await prisma.vehicle.create({
    data: {
      guestId: guest.id,
      make,
      model,
      year,
      color,
      plate,
      state,
      isDefault,
    },
  });

  if (isDefault) {
    await syncVehicleDefaults(guest.id, created.id);
  }

  await logActivity(guest.id, `Added vehicle ${year} ${make} ${model}`);

  revalidatePath("/vehicles");
  revalidatePath("/request-visit");
}

export async function updateVehicleAction(formData: FormData) {
  const guest = await requireCurrentGuest();
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const year = parseVehicleYear(formData.get("year"));
  const color = String(formData.get("color") ?? "").trim();
  const plate = String(formData.get("plate") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const isDefault = parseBoolean(formData.get("isDefault"));

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, guestId: guest.id },
  });

  if (!vehicle) {
    return;
  }

  await prisma.vehicle.update({
    where: { id: vehicle.id },
    data: {
      make,
      model,
      year,
      color,
      plate,
      state,
      isDefault,
    },
  });

  if (isDefault) {
    await syncVehicleDefaults(guest.id, vehicle.id);
  }

  await logActivity(guest.id, `Updated vehicle ${year} ${make} ${model}`);

  revalidatePath("/vehicles");
  revalidatePath("/request-visit");
  redirect("/vehicles");
}

export async function deleteVehicleAction(formData: FormData) {
  const guest = await requireCurrentGuest();
  const vehicleId = String(formData.get("vehicleId") ?? "");

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, guestId: guest.id },
  });

  if (!vehicle) {
    return;
  }

  await prisma.vehicle.delete({
    where: { id: vehicle.id },
  });

  const remaining = await prisma.vehicle.findMany({
    where: { guestId: guest.id },
    orderBy: [{ isDefault: "desc" }, { make: "asc" }, { model: "asc" }],
  });

  if (remaining.length > 0 && !remaining.some((vehicle) => vehicle.isDefault)) {
    await prisma.vehicle.update({
      where: { id: remaining[0].id },
      data: { isDefault: true },
    });
  }

  revalidatePath("/vehicles");
  revalidatePath("/request-visit");
}

export async function setDefaultVehicleAction(formData: FormData) {
  const guest = await requireCurrentGuest();
  const vehicleId = String(formData.get("vehicleId") ?? "");

  await syncVehicleDefaults(guest.id, vehicleId);

  revalidatePath("/vehicles");
  revalidatePath("/request-visit");
}

export async function requestVisitAction(formData: FormData) {
  const guest = await requireCurrentGuest();
  const vehicleId = String(formData.get("vehicleId") ?? "") || null;
  const arrivalDateTime = new Date(String(formData.get("arrivalDateTime") ?? ""));
  const departureDateTimeRaw = String(formData.get("departureDateTime") ?? "");
  const departureDateTime = departureDateTimeRaw
    ? new Date(departureDateTimeRaw)
    : null;
  const parkingRequired = parseBoolean(formData.get("parkingRequired"));
  const buildingAccessRequired = parseBoolean(
    formData.get("buildingAccessRequired"),
  );
  const apartmentAccessRequired = parseBoolean(
    formData.get("apartmentAccessRequired"),
  );
  const requestNotes = String(formData.get("requestNotes") ?? "").trim();

  await prisma.visit.create({
    data: {
      guestId: guest.id,
      vehicleId,
      arrivalDateTime,
      departureDateTime,
      parkingRequired,
      buildingAccessRequired,
      apartmentAccessRequired,
      requestNotes: requestNotes || null,
      status: "PENDING",
    },
  });

  await logActivity(
    guest.id,
    `Requested a visit for ${arrivalDateTime.toLocaleString()}`,
  );

  revalidatePath("/visits");
  revalidatePath("/requests");
  revalidatePath("/current-visit");
  redirect("/current-visit");
}

export async function updateVisitRequestAction(formData: FormData) {
  await requireAdminSession("/requests");

  const visitId = String(formData.get("visitId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "");
  const vehicleId = String(formData.get("vehicleId") ?? "") || null;
  const arrivalDateTime = new Date(String(formData.get("arrivalDateTime") ?? ""));
  const departureDateTimeRaw = String(formData.get("departureDateTime") ?? "");
  const departureDateTime = departureDateTimeRaw
    ? new Date(departureDateTimeRaw)
    : null;
  const parkingRequired = parseBoolean(formData.get("parkingRequired"));
  const buildingAccessRequired = parseBoolean(
    formData.get("buildingAccessRequired"),
  );
  const apartmentAccessRequired = parseBoolean(
    formData.get("apartmentAccessRequired"),
  );
  const requestNotes = String(formData.get("requestNotes") ?? "").trim();

  await prisma.visit.update({
    where: { id: visitId },
    data: {
      vehicleId,
      arrivalDateTime,
      departureDateTime,
      parkingRequired,
      buildingAccessRequired,
      apartmentAccessRequired,
      requestNotes: requestNotes || null,
    },
  });

  await logSystemEvent({
    category: "host_action",
    message: "Host updated visit details",
    actor: "host",
    metadata: { visitId },
  });

  revalidatePath("/requests");
  revalidatePath("/current-visit");
  revalidatePath("/request-visit");
  revalidatePath("/host");

  if (redirectTo) {
    redirect(redirectTo);
  }
}

export async function approveVisitAction(formData: FormData) {
  await requireAdminSession("/requests");

  const visitId = String(formData.get("visitId") ?? "");

  // Atomic status-guarded update: only transitions a visit that is still
  // PENDING, so a double-click or a concurrent deny can't stomp each other.
  const result = await prisma.visit.updateMany({
    where: { id: visitId, status: "PENDING" },
    data: { status: "APPROVED" },
  });

  if (result.count > 0) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { guest: true },
    });
    if (visit) {
      await logActivity(visit.guestId, "Visit request approved");
      await logSystemEvent({
        category: "host_action",
        message: `Host approved visit request for ${visit.guest.firstName} ${visit.guest.lastName}`,
        actor: "host",
        metadata: { visitId },
      });
    }
  }

  revalidatePath("/requests");
  revalidatePath("/current-visit");
  revalidatePath("/request-visit");
  revalidatePath("/dashboard");
  revalidatePath("/host");
  revalidatePath("/visits");
}

export async function denyVisitAction(formData: FormData) {
  await requireAdminSession("/requests");

  const visitId = String(formData.get("visitId") ?? "");

  const result = await prisma.visit.updateMany({
    where: { id: visitId, status: "PENDING" },
    data: { status: "DENIED" },
  });

  if (result.count > 0) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { guest: true },
    });
    if (visit) {
      await logActivity(visit.guestId, "Visit request denied");
      await logSystemEvent({
        level: "WARN",
        category: "host_action",
        message: `Host denied visit request for ${visit.guest.firstName} ${visit.guest.lastName}`,
        actor: "host",
        metadata: { visitId },
      });
    }
  }

  revalidatePath("/requests");
  revalidatePath("/current-visit");
  revalidatePath("/request-visit");
  revalidatePath("/dashboard");
  revalidatePath("/host");
  revalidatePath("/visits");
}

export async function setRememberDeviceAction(formData: FormData) {
  const guest = await requireCurrentGuest();
  const remember = parseBoolean(formData.get("remember"));

  await signInGuest(guest.id, remember);

  revalidatePath("/profile");
}

export async function deleteGuestCredentialAction(formData: FormData) {
  const guest = await requireCurrentGuest();
  const credentialId = String(formData.get("credentialId") ?? "");

  // Ownership-guarded: scoping the delete to guestId means a guest can only
  // ever remove their own passkeys, never another guest's by guessing an id.
  await prisma.guestCredential.deleteMany({
    where: { id: credentialId, guestId: guest.id },
  });

  revalidatePath("/profile");
}

export async function cancelVisitRequestAction(formData: FormData) {
  const guestId = await getCurrentGuestId();
  const visitId = String(formData.get("visitId") ?? "");

  if (guestId) {
    // Ownership-guarded: a guest can only cancel their own visit request.
    await prisma.visit.updateMany({
      where: { id: visitId, guestId },
      data: { status: "DENIED" },
    });
    await logActivity(guestId, "Cancelled a visit request");
  }

  revalidatePath("/current-visit");
  revalidatePath("/request-visit");
  revalidatePath("/visits");

  if (!guestId) {
    redirect("/request-visit");
  }

  const destination = await getGuestPortalDestination(guestId);
  redirect(destination);
}
