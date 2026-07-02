import { prisma } from "@/lib/prisma";

const INITIAL_DOORS = [
  {
    friendlyName: "2nd Floor Vehicle Gate",
    homeAssistantAction: "door.second_floor_vehicle_gate",
    enabled: true,
    doorType: "BUTTERFLY" as const,
  },
  {
    friendlyName: "Retail Garage Lobby / Elevator",
    homeAssistantAction: "door.retail_garage_lobby_elevator",
    enabled: true,
    doorType: "SMARTRENT" as const,
  },
  {
    friendlyName: "Package Locker Lobby Door",
    homeAssistantAction: "door.package_locker_lobby_door",
    enabled: true,
    doorType: "MANUAL_CODE" as const,
  },
  {
    friendlyName: "Knight St Pedestrian Gate",
    homeAssistantAction: "door.knight_st_pedestrian_gate",
    enabled: true,
    doorType: "BUTTERFLY" as const,
  },
  {
    friendlyName: "Loading Dock",
    homeAssistantAction: "door.loading_dock",
    enabled: true,
    doorType: "SMARTRENT" as const,
  },
  {
    friendlyName: "Garage Pedestrian Gate",
    homeAssistantAction: "door.garage_pedestrian_gate",
    enabled: true,
    doorType: "BUTTERFLY" as const,
  },
  {
    friendlyName: "Pool",
    homeAssistantAction: "door.pool",
    enabled: true,
    doorType: "MANUAL_CODE" as const,
  },
  {
    friendlyName: "Apartment Door 4160",
    homeAssistantAction: "door.apartment_door_4160",
    enabled: true,
    doorType: "SMARTRENT" as const,
  },
  {
    friendlyName: "Stairwell",
    homeAssistantAction: "door.stairwell",
    enabled: true,
    doorType: "MANUAL_CODE" as const,
  },
];

export async function ensureSettingsInitialized() {
  await Promise.all([
    prisma.parkingSettings.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    }),
    prisma.homeAssistantSettings.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    }),
    prisma.notificationSettings.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    }),
    prisma.brandingSettings.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    }),
  ]);

  const doorCount = await prisma.door.count();

  if (doorCount === 0) {
    await prisma.door.createMany({
      data: INITIAL_DOORS,
    });
  }
}

export async function getSettingsData() {
  await ensureSettingsInitialized();

  const [hosts, parking, homeAssistant, notifications, branding, doors] =
    await Promise.all([
      prisma.host.findMany({
        orderBy: [{ createdAt: "asc" }],
      }),
      prisma.parkingSettings.findUnique({ where: { id: 1 } }),
      prisma.homeAssistantSettings.findUnique({ where: { id: 1 } }),
      prisma.notificationSettings.findUnique({ where: { id: 1 } }),
      prisma.brandingSettings.findUnique({ where: { id: 1 } }),
      prisma.door.findMany({
        orderBy: [{ createdAt: "asc" }],
      }),
    ]);

  return {
    hosts,
    parking,
    homeAssistant,
    notifications,
    branding,
    doors,
  };
}
