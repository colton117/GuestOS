"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  isValidGuestEmail,
  isValidGuestPhone,
  normalizeGuestEmail,
  normalizeGuestPhone,
} from "@/lib/portal";

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export async function adminCreateGuestAction(formData: FormData) {
  await requireAdminSession("/quick-register");

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = normalizeGuestEmail(String(formData.get("email") ?? ""));
  const phone = normalizeGuestPhone(String(formData.get("phone") ?? ""));

  if (
    !firstName ||
    !lastName ||
    !isValidGuestEmail(email) ||
    !isValidGuestPhone(phone)
  ) {
    redirect(
      `/quick-register?error=${encodeURIComponent(
        "Please enter a valid name, email, and phone number.",
      )}`,
    );
  }

  try {
    const guest = await prisma.guest.create({
      data: { firstName, lastName, email, phone },
    });

    revalidatePath("/guests");
    redirect(`/quick-register?q=${encodeURIComponent(guest.email)}`);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect(
        `/quick-register?error=${encodeURIComponent(
          "That email or phone is already registered.",
        )}`,
      );
    }
    throw error;
  }
}

export async function adminCreateVisitAction(formData: FormData) {
  await requireAdminSession("/quick-register");

  const guestId = String(formData.get("guestId") ?? "");
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

  if (!guestId || Number.isNaN(arrivalDateTime.getTime())) {
    redirect(
      `/quick-register?error=${encodeURIComponent(
        "Please select an arrival date and time.",
      )}`,
    );
  }

  await prisma.visit.create({
    data: {
      guestId,
      vehicleId,
      arrivalDateTime,
      departureDateTime,
      parkingRequired,
      buildingAccessRequired,
      apartmentAccessRequired,
      status: "APPROVED",
    },
  });

  revalidatePath("/requests");
  revalidatePath("/guests");
  revalidatePath(`/guests/${guestId}`);
  redirect("/guests");
}
