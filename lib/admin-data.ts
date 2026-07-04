import { prisma } from "@/lib/prisma";

function buildGuestSearchWhere(query: string) {
  const trimmed = query.trim();

  if (!trimmed) {
    return undefined;
  }

  return {
    OR: [
      { firstName: { contains: trimmed } },
      { lastName: { contains: trimmed } },
      { email: { contains: trimmed } },
      { phone: { contains: trimmed } },
      { vehicles: { some: { plate: { contains: trimmed } } } },
    ],
  };
}

export async function getDashboardData() {
  const now = new Date();

  const [pendingRequests, guestsOnProperty, upcomingVisits] =
    await Promise.all([
      prisma.visit.findMany({
        where: { status: "PENDING" },
        orderBy: [{ createdAt: "asc" }],
        include: {
          guest: {
            include: {
              vehicles: true,
            },
          },
          vehicle: true,
        },
      }),
      prisma.visit.findMany({
        where: { status: "ACTIVE" },
        orderBy: [{ arrivalDateTime: "asc" }],
        include: {
          guest: true,
          vehicle: true,
        },
      }),
      prisma.visit.findMany({
        where: {
          status: "APPROVED",
          arrivalDateTime: { gte: now },
        },
        orderBy: [{ arrivalDateTime: "asc" }],
        include: {
          guest: true,
          vehicle: true,
        },
      }),
    ]);

  return {
    pendingRequests,
    guestsOnProperty,
    upcomingVisits,
    pendingRequestCount: pendingRequests.length,
    guestsOnPropertyCount: guestsOnProperty.length,
    upcomingVisitCount: upcomingVisits.length,
  };
}

export async function getPendingRequestCount() {
  return prisma.visit.count({ where: { status: "PENDING" } });
}

export async function getGuests(query: string) {
  const where = buildGuestSearchWhere(query);

  return prisma.guest.findMany({
    where,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      vehicles: true,
      visits: true,
    },
  });
}

export async function getGuestById(guestId: string) {
  return prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      vehicles: {
        orderBy: [{ isDefault: "desc" }, { make: "asc" }],
      },
      visits: {
        orderBy: [{ arrivalDateTime: "desc" }],
        include: { vehicle: true },
      },
    },
  });
}

export async function getVisits() {
  return prisma.visit.findMany({
    orderBy: [{ arrivalDateTime: "asc" }],
    include: {
      guest: {
        include: {
          vehicles: true,
        },
      },
    },
  });
}

export async function getPendingRequests() {
  return prisma.visit.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: [{ createdAt: "asc" }],
    include: {
      guest: {
        include: {
          vehicles: true,
        },
      },
      vehicle: true,
    },
  });
}

export async function findQuickRegisterMatch(query: string) {
  const trimmed = query.trim();

  if (!trimmed) {
    return null;
  }

  return prisma.guest.findFirst({
    where: {
      OR: [
        { firstName: { contains: trimmed } },
        { lastName: { contains: trimmed } },
        { email: { contains: trimmed } },
        { phone: { contains: trimmed } },
        { vehicles: { some: { plate: { contains: trimmed } } } },
      ],
    },
    include: {
      vehicles: true,
    },
  });
}
