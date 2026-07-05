"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireSuperadminSession } from "@/lib/admin-auth";
import { createHomeAssistantClientFromSettings, pingHomeAssistant } from "@/lib/homeassistant/client";
import { createHomeAssistantServiceLayer } from "@/lib/homeassistant/services";
import type { HomeAssistantData } from "@/lib/homeassistant/types";
import { toScriptEntityId } from "@/lib/access";
import { logSystemEvent } from "@/lib/system-log";

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
    await logSystemEvent({
      category: "admin_action",
      message: `Operator updated host ${name}`,
      actor: "operator",
      metadata: { hostId },
    });
  } else {
    const created = await prisma.host.create({
      data: { name, email, phone },
    });
    await logSystemEvent({
      category: "admin_action",
      message: `Operator added host ${name}`,
      actor: "operator",
      metadata: { hostId: created.id },
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

  const deleted = await prisma.host.delete({
    where: { id: hostId },
  });

  await logSystemEvent({
    level: "WARN",
    category: "admin_action",
    message: `Operator deleted host ${deleted.name}`,
    actor: "operator",
    metadata: { hostId },
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

  await logSystemEvent({
    category: "host_action",
    message: "Host updated parking settings",
    actor: "host",
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

  await logSystemEvent({
    category: "admin_action",
    message: "Operator updated maximum parking duration",
    actor: "operator",
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

  await logSystemEvent({
    category: "admin_action",
    message: "Operator updated Home Assistant settings",
    actor: "operator",
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

  await logSystemEvent({
    level: failureMessage ? "ERROR" : "INFO",
    category: "home_assistant",
    message: failureMessage
      ? `Home Assistant connection test failed: ${failureMessage}`
      : "Home Assistant connection test succeeded",
    actor: "operator",
  });

  if (failureMessage) {
    redirect(
      `/admin/property?haTest=failed&haTestMessage=${encodeURIComponent(failureMessage)}`,
    );
  }

  redirect("/admin/property?haTest=success");
}

export async function testDoorAction(formData: FormData) {
  await requireSuperadminSession("/admin/property");

  const doorId = String(formData.get("doorId") ?? "");
  const door = await prisma.door.findUnique({ where: { id: doorId } });

  if (!door) {
    redirect("/admin/property");
  }

  let failureMessage: string | null = null;

  try {
    const client = await createHomeAssistantClientFromSettings();
    const homeAssistant = createHomeAssistantServiceLayer(client);
    await homeAssistant.runScript({
      entity_id: toScriptEntityId(door.homeAssistantAction),
      access_point: "admin-test",
      guest_id: "operator",
      visit_id: "admin-test",
      home_assistant_action: door.homeAssistantAction,
    } as HomeAssistantData);
  } catch (error) {
    failureMessage = error instanceof Error ? error.message : "Unknown error.";
  }

  await logSystemEvent({
    level: failureMessage ? "ERROR" : "INFO",
    category: "home_assistant",
    message: failureMessage
      ? `Operator test of door "${door.friendlyName}" failed: ${failureMessage}`
      : `Operator tested door "${door.friendlyName}" successfully`,
    actor: "operator",
    metadata: { doorId },
  });

  if (failureMessage) {
    redirect(
      `/admin/property?doorTest=failed&doorTestMessage=${encodeURIComponent(failureMessage)}&doorTestDoor=${encodeURIComponent(door.friendlyName)}`,
    );
  }

  redirect(
    `/admin/property?doorTest=success&doorTestDoor=${encodeURIComponent(door.friendlyName)}`,
  );
}

export async function saveGuidePointPhotoAction(formData: FormData) {
  await requireSuperadminSession("/admin/property");

  const stepId = String(formData.get("stepId") ?? "").trim();

  if (!stepId) {
    redirect("/admin/property");
  }

  const photoFile = parseFileData(formData.get("photoUpload"));

  if (photoFile) {
    const photoData = Buffer.from(await photoFile.arrayBuffer());
    const photoMimeType = photoFile.type;

    await prisma.guidePoint.upsert({
      where: { stepId },
      create: { stepId, photoData, photoMimeType },
      update: { photoData, photoMimeType },
    });

    await logSystemEvent({
      category: "admin_action",
      message: `Operator set a reference photo for guide step "${stepId}"`,
      actor: "operator",
      metadata: { stepId },
    });
  }

  revalidatePath("/admin/property");
  redirect("/admin/property?guidePointsTab=1");
}

export async function deleteGuidePointPhotoAction(formData: FormData) {
  await requireSuperadminSession("/admin/property");

  const stepId = String(formData.get("stepId") ?? "").trim();

  if (!stepId) {
    return;
  }

  await prisma.guidePoint.deleteMany({ where: { stepId } });

  await logSystemEvent({
    category: "admin_action",
    message: `Operator removed the reference photo for guide step "${stepId}"`,
    actor: "operator",
    metadata: { stepId },
  });

  revalidatePath("/admin/property");
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

  await logSystemEvent({
    category: "host_action",
    message: "Host updated notification settings",
    actor: "host",
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

  await logSystemEvent({
    category: "admin_action",
    message: "Operator updated branding settings",
    actor: "operator",
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
    await logSystemEvent({
      category: "admin_action",
      message: `Operator updated door ${friendlyName}`,
      actor: "operator",
      metadata: { doorId },
    });
  } else {
    const created = await prisma.door.create({
      data: {
        friendlyName,
        homeAssistantAction,
        enabled,
        doorType,
      },
    });
    await logSystemEvent({
      category: "admin_action",
      message: `Operator added door ${friendlyName}`,
      actor: "operator",
      metadata: { doorId: created.id },
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

  const deleted = await prisma.door.delete({
    where: { id: doorId },
  });

  await logSystemEvent({
    level: "WARN",
    category: "admin_action",
    message: `Operator deleted door ${deleted.friendlyName}`,
    actor: "operator",
    metadata: { doorId },
  });

  revalidatePath("/admin/property");
}
