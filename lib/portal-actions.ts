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
  normalizeGuestEmail,
  normalizeGuestPhone,
  PORTAL_GUEST_COOKIE,
  requireCurrentGuest,
} from "@/lib/portal";

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

async function signInGuest(guestId: string) {
  const cookieStore = await cookies();
  cookieStore.set(PORTAL_GUEST_COOKIE, guestId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
}

/**
 * Looks up a guest by the email or phone they entered. If found, logs them
 * straight in. If not, sends them to the create-account step, prefilled with
 * whatever they typed.
 */
export async function lookupGuestAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();

  if (!identifier) {
    redirect("/login");
  }

  const guest = await findGuestByIdentifier(identifier);

  if (!guest) {
    redirect(`/login?identifier=${encodeURIComponent(identifier)}`);
  }

  await signInGuest(guest.id);

  const destination = await getGuestPortalDestination(guest.id);
  redirect(destination);
}

export async function createGuestAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!firstName || !lastName || !email || !phone) {
    redirect(
      `/login?identifier=${encodeURIComponent(identifier)}&error=${encodeURIComponent(
        "Please fill in every field.",
      )}`,
    );
  }

  let guestId: string;

  try {
    const guest = await prisma.guest.create({
      data: {
        firstName,
        lastName,
        email: normalizeGuestEmail(email),
        phone: normalizeGuestPhone(phone),
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
  redirect("/request-visit");
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
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  await prisma.guest.update({
    where: { id: guest.id },
    data: {
      firstName,
      lastName,
      email,
      phone,
    },
  });

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
  const year = Number(formData.get("year"));
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

  revalidatePath("/vehicles");
  revalidatePath("/request-visit");
}

export async function updateVehicleAction(formData: FormData) {
  const guest = await requireCurrentGuest();
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const year = Number(formData.get("year"));
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

  revalidatePath("/vehicles");
  revalidatePath("/request-visit");
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

  revalidatePath("/visits");
  revalidatePath("/requests");
  revalidatePath("/current-visit");
  redirect("/current-visit");
}

export async function updateVisitRequestAction(formData: FormData) {
  const visitId = String(formData.get("visitId") ?? "");
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

  revalidatePath("/requests");
  revalidatePath("/current-visit");
  revalidatePath("/request-visit");
}

export async function approveVisitAction(formData: FormData) {
  const visitId = String(formData.get("visitId") ?? "");
  await prisma.visit.update({
    where: { id: visitId },
    data: { status: "APPROVED" },
  });

  revalidatePath("/requests");
  revalidatePath("/current-visit");
  revalidatePath("/request-visit");
  revalidatePath("/dashboard");
  revalidatePath("/visits");
}

export async function denyVisitAction(formData: FormData) {
  const visitId = String(formData.get("visitId") ?? "");
  await prisma.visit.update({
    where: { id: visitId },
    data: { status: "DENIED" },
  });

  revalidatePath("/requests");
  revalidatePath("/current-visit");
  revalidatePath("/request-visit");
  revalidatePath("/dashboard");
  revalidatePath("/visits");
}

export async function cancelVisitRequestAction(formData: FormData) {
  const visitId = String(formData.get("visitId") ?? "");

  await prisma.visit.update({
    where: { id: visitId },
    data: { status: "DENIED" },
  });

  const guestId = await getCurrentGuestId();

  revalidatePath("/current-visit");
  revalidatePath("/request-visit");
  revalidatePath("/visits");

  if (!guestId) {
    redirect("/request-visit");
  }

  const destination = await getGuestPortalDestination(guestId);
  redirect(destination);
}
