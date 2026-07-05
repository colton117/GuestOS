"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { isValidGuestEmail, isValidGuestPhone, normalizeGuestEmail, normalizeGuestPhone } from "@/lib/portal";
import { logSystemEvent } from "@/lib/system-log";

const MIN_VEHICLE_YEAR = 1900;

function parseVehicleYear(value: FormDataEntryValue | null): number {
  const parsed = Number(value);
  const currentYear = new Date().getFullYear();

  if (!Number.isFinite(parsed) || parsed < MIN_VEHICLE_YEAR || parsed > currentYear + 1) {
    return currentYear;
  }

  return parsed;
}

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
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

export async function adminUpdateGuestAction(formData: FormData) {
  await requireAdminSession("/guests");

  const guestId = String(formData.get("guestId") ?? "");

  if (!guestId) {
    redirect("/guests");
  }

  // Callers outside the guest detail page (e.g. the quick-register edit
  // modal) need to land back where they started rather than on
  // /guests/{id} — these default to the guest detail page's own behavior
  // when omitted, so that page needs no changes.
  const successRedirect =
    String(formData.get("successRedirect") ?? "") || `/guests/${guestId}`;
  const errorRedirect =
    String(formData.get("errorRedirect") ?? "") ||
    `/guests/${guestId}?edit=1&error=invalid`;

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = normalizeGuestEmail(String(formData.get("email") ?? ""));
  const phone = normalizeGuestPhone(String(formData.get("phone") ?? ""));

  if (!firstName || !lastName || !isValidGuestEmail(email) || !isValidGuestPhone(phone)) {
    redirect(errorRedirect);
  }

  await prisma.guest.update({
    where: { id: guestId },
    data: { firstName, lastName, email, phone },
  });

  await logSystemEvent({
    category: "host_action",
    message: `Host updated guest profile for ${firstName} ${lastName}`,
    actor: "host",
    metadata: { guestId },
  });

  revalidatePath("/guests");
  revalidatePath(`/guests/${guestId}`);
  revalidatePath("/quick-register");
  redirect(successRedirect);
}

export async function adminAddVehicleAction(formData: FormData) {
  await requireAdminSession("/guests");

  const guestId = String(formData.get("guestId") ?? "");

  if (!guestId) {
    redirect("/guests");
  }

  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const year = parseVehicleYear(formData.get("year"));
  const color = String(formData.get("color") ?? "").trim();
  const plate = String(formData.get("plate") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const isDefault = parseBoolean(formData.get("isDefault"));

  const created = await prisma.vehicle.create({
    data: { guestId, make, model, year, color, plate, state, isDefault },
  });

  if (isDefault) {
    await syncVehicleDefaults(guestId, created.id);
  }

  await logSystemEvent({
    category: "host_action",
    message: `Host added vehicle ${year} ${make} ${model} for a guest`,
    actor: "host",
    metadata: { guestId, vehicleId: created.id },
  });

  revalidatePath(`/guests/${guestId}`);
  redirect(`/guests/${guestId}`);
}

export async function adminUpdateVehicleAction(formData: FormData) {
  await requireAdminSession("/guests");

  const guestId = String(formData.get("guestId") ?? "");
  const vehicleId = String(formData.get("vehicleId") ?? "");

  if (!guestId || !vehicleId) {
    redirect("/guests");
  }

  // Callers outside the guest detail page (e.g. the quick-register edit
  // modal) need to land back where they started — defaults to the guest
  // detail page's own behavior when omitted, so that page needs no changes.
  const successRedirect =
    String(formData.get("successRedirect") ?? "") || `/guests/${guestId}`;

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, guestId },
  });

  if (!vehicle) {
    redirect(`/guests/${guestId}`);
  }

  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const year = parseVehicleYear(formData.get("year"));
  const color = String(formData.get("color") ?? "").trim();
  const plate = String(formData.get("plate") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const isDefault = parseBoolean(formData.get("isDefault"));

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { make, model, year, color, plate, state, isDefault },
  });

  if (isDefault) {
    await syncVehicleDefaults(guestId, vehicleId);
  }

  await logSystemEvent({
    category: "host_action",
    message: `Host updated vehicle ${year} ${make} ${model} for a guest`,
    actor: "host",
    metadata: { guestId, vehicleId },
  });

  revalidatePath(`/guests/${guestId}`);
  revalidatePath("/quick-register");
  redirect(successRedirect);
}
