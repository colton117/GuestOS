import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const prisma = new PrismaClient();

function encodeBytes(value) {
  if (value instanceof Uint8Array) {
    return { __bytes__: Buffer.from(value).toString("base64") };
  }
  return value;
}

function encodeRow(row) {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = encodeBytes(value);
  }
  return out;
}

async function main() {
  const data = {
    Host: (await prisma.host.findMany()).map(encodeRow),
    Guest: (await prisma.guest.findMany()).map(encodeRow),
    GuestCredential: (await prisma.guestCredential.findMany()).map(encodeRow),
    Vehicle: (await prisma.vehicle.findMany()).map(encodeRow),
    Visit: (await prisma.visit.findMany()).map(encodeRow),
    ParkingSettings: (await prisma.parkingSettings.findMany()).map(encodeRow),
    HomeAssistantSettings: (await prisma.homeAssistantSettings.findMany()).map(encodeRow),
    NotificationSettings: (await prisma.notificationSettings.findMany()).map(encodeRow),
    BrandingSettings: (await prisma.brandingSettings.findMany()).map(encodeRow),
    Door: (await prisma.door.findMany()).map(encodeRow),
  };

  writeFileSync(process.argv[2] ?? "export.json", JSON.stringify(data, null, 2));

  for (const [table, rows] of Object.entries(data)) {
    console.log(`${table}: ${rows.length}`);
  }
}

main().finally(() => prisma.$disconnect());
