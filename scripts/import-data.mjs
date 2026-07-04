import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function decodeValue(value) {
  if (value && typeof value === "object" && "__bytes__" in value) {
    return Buffer.from(value.__bytes__, "base64");
  }
  if (typeof value === "string" && ISO_DATE_RE.test(value)) {
    return new Date(value);
  }
  return value;
}

function decodeRow(row) {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = decodeValue(value);
  }
  return out;
}

async function main() {
  const data = JSON.parse(readFileSync(process.argv[2] ?? "export.json", "utf8"));

  await prisma.$transaction(async (tx) => {
    for (const table of [
      "Host",
      "Guest",
      "GuestCredential",
      "Vehicle",
      "Visit",
      "ParkingSettings",
      "HomeAssistantSettings",
      "NotificationSettings",
      "BrandingSettings",
      "Door",
    ]) {
      const model = table[0].toLowerCase() + table.slice(1);
      const rows = (data[table] ?? []).map(decodeRow);
      for (const row of rows) {
        await tx[model].create({ data: row });
      }
      console.log(`${table}: imported ${rows.length}`);
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
