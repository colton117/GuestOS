import { PrismaClient, VisitStatus } from "@prisma/client";

const prisma = new PrismaClient();

const initialDoors = [
  {
    friendlyName: "2nd Floor Vehicle Gate",
    homeAssistantAction: "door.second_floor_vehicle_gate",
    enabled: true,
    doorType: "BUTTERFLY",
  },
  {
    friendlyName: "Retail Garage Lobby / Elevator",
    homeAssistantAction: "door.retail_garage_lobby_elevator",
    enabled: true,
    doorType: "SMARTRENT",
  },
  {
    friendlyName: "Package Locker Lobby Door",
    homeAssistantAction: "door.package_locker_lobby_door",
    enabled: true,
    doorType: "MANUAL_CODE",
  },
  {
    friendlyName: "Knight St Pedestrian Gate",
    homeAssistantAction: "door.knight_st_pedestrian_gate",
    enabled: true,
    doorType: "BUTTERFLY",
  },
  {
    friendlyName: "Loading Dock",
    homeAssistantAction: "door.loading_dock",
    enabled: true,
    doorType: "SMARTRENT",
  },
  {
    friendlyName: "Garage Pedestrian Gate",
    homeAssistantAction: "door.garage_pedestrian_gate",
    enabled: true,
    doorType: "BUTTERFLY",
  },
  {
    friendlyName: "Pool",
    homeAssistantAction: "door.pool",
    enabled: true,
    doorType: "MANUAL_CODE",
  },
  {
    friendlyName: "Apartment Door 4160",
    homeAssistantAction: "door.apartment_door_4160",
    enabled: true,
    doorType: "SMARTRENT",
  },
  {
    friendlyName: "Stairwell",
    homeAssistantAction: "door.stairwell",
    enabled: true,
    doorType: "MANUAL_CODE",
  },
];

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

async function main() {
  await prisma.visit.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.guest.deleteMany();

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

  if ((await prisma.door.count()) === 0) {
    await prisma.door.createMany({
      data: initialDoors,
    });
  }

  const now = new Date();

  const guestOne = await prisma.guest.create({
    data: {
      firstName: "Ava",
      lastName: "Martinez",
      email: "ava.martinez@example.com",
      phone: "555-0101",
      vehicles: {
        create: [
          {
            make: "Toyota",
            model: "Camry",
            year: 2021,
            color: "Silver",
            plate: "GS-1024",
            state: "CA",
            isDefault: true,
          },
          {
            make: "Honda",
            model: "Civic",
            year: 2020,
            color: "Blue",
            plate: "GS-2048",
            state: "CA",
            isDefault: false,
          },
        ],
      },
    },
    include: { vehicles: true },
  });

  const guestTwo = await prisma.guest.create({
    data: {
      firstName: "Noah",
      lastName: "Bennett",
      email: "noah.bennett@example.com",
      phone: "555-0122",
      vehicles: {
        create: [
          {
            make: "Ford",
            model: "Escape",
            year: 2022,
            color: "White",
            plate: "NB-7788",
            state: "TX",
            isDefault: true,
          },
        ],
      },
    },
    include: { vehicles: true },
  });

  await prisma.visit.createMany({
    data: [
      {
        guestId: guestOne.id,
        vehicleId: guestOne.vehicles[0].id,
        arrivalDateTime: addHours(now, -2),
        departureDateTime: addHours(now, 3),
        parkingRequired: true,
        buildingAccessRequired: true,
        apartmentAccessRequired: false,
        status: VisitStatus.ACTIVE,
        requestNotes: "Package drop-off before the afternoon meeting.",
      },
      {
        guestId: guestOne.id,
        vehicleId: guestOne.vehicles[1].id,
        arrivalDateTime: addHours(now, 24),
        departureDateTime: addHours(now, 28),
        parkingRequired: true,
        buildingAccessRequired: true,
        apartmentAccessRequired: true,
        status: VisitStatus.APPROVED,
        requestNotes: "Dinner with family.",
      },
      {
        guestId: guestOne.id,
        vehicleId: guestOne.vehicles[0].id,
        arrivalDateTime: addHours(now, -72),
        departureDateTime: addHours(now, -68),
        parkingRequired: false,
        buildingAccessRequired: true,
        apartmentAccessRequired: true,
        status: VisitStatus.COMPLETED,
        requestNotes: "Weekend visit.",
      },
      {
        guestId: guestTwo.id,
        vehicleId: guestTwo.vehicles[0].id,
        arrivalDateTime: addHours(now, 48),
        departureDateTime: addHours(now, 52),
        parkingRequired: true,
        buildingAccessRequired: true,
        apartmentAccessRequired: true,
        status: VisitStatus.PENDING,
        requestNotes: "Pending guest request for the weekend.",
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
