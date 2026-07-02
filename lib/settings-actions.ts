"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

export async function saveHostAction(formData: FormData) {
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

  revalidatePath("/settings");
}

export async function deleteHostAction(formData: FormData) {
  const hostId = String(formData.get("hostId") ?? "");

  if (!hostId) {
    return;
  }

  await prisma.host.delete({
    where: { id: hostId },
  });

  revalidatePath("/settings");
}

export async function saveParkingAction(formData: FormData) {
  await prisma.parkingSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      currentQuarterlyPromoCode: parseOptionalString(
        formData.get("currentQuarterlyPromoCode"),
      ),
      parkingEnabled: parseBoolean(formData.get("parkingEnabled")),
      maximumParkingDuration:
        parseOptionalNumber(formData.get("maximumParkingDuration")) ?? 24,
    },
    update: {
      currentQuarterlyPromoCode: parseOptionalString(
        formData.get("currentQuarterlyPromoCode"),
      ),
      parkingEnabled: parseBoolean(formData.get("parkingEnabled")),
      maximumParkingDuration:
        parseOptionalNumber(formData.get("maximumParkingDuration")) ?? 24,
    },
  });

  revalidatePath("/settings");
}

export async function saveHomeAssistantAction(formData: FormData) {
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

  revalidatePath("/settings");
}

export async function testHomeAssistantAction() {
  redirect("/settings?haTest=local-success");
}

export async function saveNotificationAction(formData: FormData) {
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
  const logoFile = parseFileData(formData.get("logoUpload"));
  const logoData = logoFile ? Buffer.from(await logoFile.arrayBuffer()) : null;
  const logoMimeType = logoFile?.type || null;
  const welcomeMessage = parseOptionalString(formData.get("welcomeMessage"));

  await prisma.brandingSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      logoData,
      logoMimeType,
      welcomeMessage,
    },
    update: {
      ...(logoFile
        ? {
            logoData,
            logoMimeType,
          }
        : {}),
      welcomeMessage,
    },
  });

  revalidatePath("/settings");
}

export async function saveDoorAction(formData: FormData) {
  const doorId = parseOptionalString(formData.get("doorId"));
  const friendlyName = String(formData.get("friendlyName") ?? "").trim();
  const homeAssistantAction = String(
    formData.get("homeAssistantAction") ?? "",
  ).trim();
  const enabled = parseBoolean(formData.get("enabled"));
  const doorType = String(formData.get("doorType") ?? "MANUAL_CODE");

  if (doorId) {
    await prisma.door.update({
      where: { id: doorId },
      data: {
        friendlyName,
        homeAssistantAction,
        enabled,
        doorType: doorType as never,
      },
    });
  } else {
    await prisma.door.create({
      data: {
        friendlyName,
        homeAssistantAction,
        enabled,
        doorType: doorType as never,
      },
    });
  }

  revalidatePath("/settings");
}

export async function deleteDoorAction(formData: FormData) {
  const doorId = String(formData.get("doorId") ?? "");

  if (!doorId) {
    return;
  }

  await prisma.door.delete({
    where: { id: doorId },
  });

  revalidatePath("/settings");
}
