import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const PORTAL_GUEST_COOKIE = "guestos_portal_guest_id";

type PortalVisit = {
  id: string;
  arrivalDateTime: Date;
  departureDateTime: Date | null;
  status: string;
  parkingRequired?: boolean;
  buildingAccessRequired?: boolean;
  apartmentAccessRequired?: boolean;
};

export async function getCurrentGuestId() {
  const cookieStore = await cookies();
  return cookieStore.get(PORTAL_GUEST_COOKIE)?.value ?? null;
}

export async function getCurrentGuest() {
  const guestId = await getCurrentGuestId();

  if (!guestId) {
    return null;
  }

  return prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      vehicles: true,
    },
  });
}

export async function requireCurrentGuest() {
  const guest = await getCurrentGuest();

  if (!guest) {
    redirect("/login");
  }

  return guest;
}

export async function getLoginGuests() {
  return prisma.guest.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      vehicles: true,
    },
  });
}

export function classifyVisits(visits: PortalVisit[]) {
  const now = new Date();

  const current = visits.filter((visit) => {
    const withinWindow =
      visit.arrivalDateTime <= now &&
      (!visit.departureDateTime || visit.departureDateTime >= now);

    return visit.status === "ACTIVE" || withinWindow;
  });

  const upcoming = visits.filter((visit) => visit.arrivalDateTime > now);
  const past = visits.filter((visit) => {
    const ended = visit.departureDateTime ? visit.departureDateTime < now : false;
    return ended || visit.status === "COMPLETED" || visit.status === "DENIED";
  });

  return {
    current,
    upcoming,
    past,
  };
}

export async function getGuestVisits(guestId: string) {
  const visits = await prisma.visit.findMany({
    where: { guestId },
    orderBy: [{ arrivalDateTime: "desc" }],
    include: {
      vehicle: true,
    },
  });

  return classifyVisits(visits);
}

export async function getGuestVehicles(guestId: string) {
  return prisma.vehicle.findMany({
    where: { guestId },
    orderBy: [{ isDefault: "desc" }, { make: "asc" }, { model: "asc" }],
  });
}

export async function getDashboardSummary(guestId: string) {
  const visits = await prisma.visit.findMany({
    where: { guestId },
    orderBy: [{ arrivalDateTime: "desc" }],
  });

  const grouped = classifyVisits(visits);

  return {
    currentVisit: grouped.current[0] ?? null,
    upcomingVisits: grouped.upcoming,
    pastVisits: grouped.past,
  };
}
