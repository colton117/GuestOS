"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireSuperadminSession } from "@/lib/admin-auth";
import { pingHomeAssistant } from "@/lib/homeassistant/client";

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseOptionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }

  const numberValue = Number(text);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function parseFileData(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function parseHexColor(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return HEX_COLOR_PATTERN.test(text) ? text.toUpperCase() : null;
}

export async function saveHostAction(formData: FormData) {
  await requireSuperadminSession("/admin/hosts");

  const hostId = parseOptionalString(formData.get("hostId"));
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (hostId) {
    await prisma.host.update({
      where: { id: hostId },
      data: { name, email, phone },
    });
  } else {
    await prisma.host.create({
      data: { name, email, phone },
    });
  }

  revalidatePath("/admin/hosts");
  revalidatePath("/settings");
  redirect("/admin/hosts");
}

export async function deleteHostAction(formData: FormData) {
  await requireSuperadminSession("/admin/hosts");

  const hostId = String(formData.get("hostId") ?? "");

  if (!hostId) {
    return;
  }

  await prisma.host.delete({
    where: { id: hostId },
  });

  revalidatePath("/admin/hosts");
  revalidatePath("/settings");
}

export async function saveParkingAction(formData: FormData) {
  await requireAdminSession("/settings");

  await prisma.parkingSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      currentQuarterlyPromoCode: parseOptionalString(
        formData.get("currentQuarterlyPromoCode"),
      ),
      parkingEnabled: parseBoolean(formData.get("parkingEnabled")),
    },
    update: {
      currentQuarterlyPromoCode: parseOptionalString(
        formData.get("currentQuarterlyPromoCode"),
      ),
      parkingEnabled: parseBoolean(formData.get("parkingEnabled")),
    },
  });

  revalidatePath("/settings");
}

export async function saveMaxParkingDurationAction(formData: FormData) {
  await requireSuperadminSession("/admin/property");

  await prisma.parkingSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      maximumParkingDuration:
        parseOptionalNumber(formData.get("maximumParkingDuration")) ?? 7,
    },
    update: {
      maximumParkingDuration:
        parseOptionalNumber(formData.get("maximumParkingDuration")) ?? 7,
    },
  });

  revalidatePath("/admin/property");
  revalidatePath("/settings");
}

export async function saveHomeAssistantAction(formData: FormData) {
  await requireSuperadminSession("/admin/property");

  await prisma.homeAssistantSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      haUrl: parseOptionalString(formData.get("haUrl")),
      haToken: parseOptionalString(formData.get("haToken")),
      webhookTimeout:
        parseOptionalNumber(formData.get("webhookTimeout")) ?? 10,
    },
    update: {
      haUrl: parseOptionalString(formData.get("haUrl")),
      haToken: parseOptionalString(formData.get("haToken")),
      webhookTimeout:
        parseOptionalNumber(formData.get("webhookTimeout")) ?? 10,
    },
  });

  revalidatePath("/admin/property");
}

export async function testHomeAssistantAction() {
  await requireSuperadminSession("/admin/property");

  let failureMessage: string | null = null;

  try {
    await pingHomeAssistant();
  } catch (error) {
    failureMessage = error instanceof Error ? error.message : "Unknown error.";
  }

  if (failureMessage) {
    redirect(
      `/admin/property?haTest=failed&haTestMessage=${encodeURIComponent(failureMessage)}`,
    );
  }

  redirect("/admin/property?haTest=success");
}

export async function saveNotificationAction(formData: FormData) {
  await requireAdminSession("/settings");

  await prisma.notificationSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      hostEmail: parseOptionalString(formData.get("hostEmail")),
      appleNotificationEnabled: parseBoolean(
        formData.get("appleNotificationEnabled"),
      ),
      guestEmailEnabled: parseBoolean(formData.get("guestEmailEnabled")),
    },
    update: {
      hostEmail: parseOptionalString(formData.get("hostEmail")),
      appleNotificationEnabled: parseBoolean(
        formData.get("appleNotificationEnabled"),
      ),
      guestEmailEnabled: parseBoolean(formData.get("guestEmailEnabled")),
    },
  });

  revalidatePath("/settings");
}

export async function saveBrandingAction(formData: FormData) {
  await requireSuperadminSession("/admin/property");

  const logoFile = parseFileData(formData.get("logoUpload"));
  const logoData = logoFile ? Buffer.from(await logoFile.arrayBuffer()) : null;
  const logoMimeType = logoFile?.type || null;
  const welcomeMessage = parseOptionalString(formData.get("welcomeMessage"));
  const primaryColor = parseHexColor(formData.get("primaryColor"));
  const accentColor = parseHexColor(formData.get("accentColor"));

  await prisma.brandingSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      logoData,
      logoMimeType,
      welcomeMessage,
      primaryColor,
      accentColor,
    },
    update: {
      ...(logoFile
        ? {
            logoData,
            logoMimeType,
          }
        : {}),
      welcomeMessage,
      primaryColor,
      accentColor,
    },
  });

  revalidatePath("/admin/property");
}

const VALID_DOOR_TYPES = ["BUTTERFLY", "SMARTRENT", "MANUAL_CODE"] as const;
type DoorTypeValue = (typeof VALID_DOOR_TYPES)[number];

function parseDoorType(value: FormDataEntryValue | null): DoorTypeValue {
  const text = String(value ?? "");
  return (VALID_DOOR_TYPES as readonly string[]).includes(text)
    ? (text as DoorTypeValue)
    : "MANUAL_CODE";
}

export async function saveDoorAction(formData: FormData) {
  await requireSuperadminSession("/admin/property");

  const doorId = parseOptionalString(formData.get("doorId"));
  const friendlyName = String(formData.get("friendlyName") ?? "").trim();
  const homeAssistantAction = String(
    formData.get("homeAssistantAction") ?? "",
  ).trim();
  const enabled = parseBoolean(formData.get("enabled"));
  const doorType = parseDoorType(formData.get("doorType"));

  if (doorId) {
    await prisma.door.update({
      where: { id: doorId },
      data: {
        friendlyName,
        homeAssistantAction,
        enabled,
        doorType,
      },
    });
  } else {
    await prisma.door.create({
      data: {
        friendlyName,
        homeAssistantAction,
        enabled,
        doorType,
      },
    });
  }

  revalidatePath("/admin/property");
  redirect("/admin/property");
}

export async function deleteDoorAction(formData: FormData) {
  await requireSuperadminSession("/admin/property");

  const doorId = String(formData.get("doorId") ?? "");

  if (!doorId) {
    return;
  }

  await prisma.door.delete({
    where: { id: doorId },
  });

  revalidatePath("/admin/property");
}
