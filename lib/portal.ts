import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const PORTAL_GUEST_COOKIE = "guestos_portal_guest_id";

type PortalVisit = {
  id: string;
  arrivalDateTime: Date;
  departureDateTime: Date | null;
  status: string;
  createdAt: Date;
  parkingRequired: boolean;
  buildingAccessRequired: boolean;
  apartmentAccessRequired: boolean;
  requestNotes: string | null;
  vehicle:
    | {
        id: string;
        make: string;
        model: string;
        year: number;
        color: string;
        plate: string;
        state: string;
        isDefault: boolean;
      }
    | null;
};

export type GuestVisitStateKind =
  | "active_visit"
  | "upcoming_approved_visit"
  | "pending_visit_request"
  | "no_visit";

export interface GuestVisitStateVisit {
  id: string;
  status: string;
  arrivalDateTime: Date;
  departureDateTime: Date | null;
  createdAt: Date;
  parkingRequired: boolean;
  buildingAccessRequired: boolean;
  apartmentAccessRequired: boolean;
  requestNotes: string | null;
  vehicle:
    | {
        id: string;
        make: string;
        model: string;
        year: number;
        color: string;
        plate: string;
        state: string;
        isDefault: boolean;
      }
    | null;
}

export interface GuestVisitState {
  kind: GuestVisitStateKind;
  visit: GuestVisitStateVisit | null;
}

export function resolveGuestVisitState(
  visits: PortalVisit[],
  now: Date = new Date(),
): GuestVisitState {
  const sortedByArrivalAscending = [...visits].sort(
    (left, right) =>
      left.arrivalDateTime.getTime() - right.arrivalDateTime.getTime(),
  );

  const activeVisit = sortedByArrivalAscending.find((visit) => {
    const withinWindow =
      visit.arrivalDateTime <= now &&
      (!visit.departureDateTime || visit.departureDateTime >= now);

    return visit.status === "ACTIVE" || (visit.status === "APPROVED" && withinWindow);
  });

  if (activeVisit) {
    return {
      kind: "active_visit",
      visit: activeVisit,
    };
  }

  const upcomingApprovedVisit = sortedByArrivalAscending.find(
    (visit) => visit.status === "APPROVED" && visit.arrivalDateTime > now,
  );

  if (upcomingApprovedVisit) {
    return {
      kind: "upcoming_approved_visit",
      visit: upcomingApprovedVisit,
    };
  }

  const pendingVisitRequest = [...visits]
    .filter((visit) => visit.status === "PENDING")
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];

  if (pendingVisitRequest) {
    return {
      kind: "pending_visit_request",
      visit: pendingVisitRequest,
    };
  }

  return {
    kind: "no_visit",
    visit: null,
  };
}

export async function getGuestVisitState(guestId: string): Promise<GuestVisitState> {
  const visits = await prisma.visit.findMany({
    where: { guestId },
    orderBy: [{ createdAt: "desc" }],
    include: {
      vehicle: true,
    },
  });

  return resolveGuestVisitState(visits);
}

export async function getGuestPortalDestination(guestId: string) {
  const state = await getGuestVisitState(guestId);

  return state.kind === "no_visit" ? "/request-visit" : "/current-visit";
}

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

export function normalizeGuestEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeGuestPhone(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Looks up a guest by email or phone. Accepts either format in a single
 * field: values containing "@" are matched against email, everything else
 * is matched against phone (digits-only, so formatting like dashes or
 * parentheses doesn't matter).
 */
export async function findGuestByIdentifier(identifier: string) {
  const trimmed = identifier.trim();

  if (!trimmed) {
    return null;
  }

  const normalizedPhone = normalizeGuestPhone(trimmed);

  return prisma.guest.findFirst({
    where: {
      OR: [
        { email: normalizeGuestEmail(trimmed) },
        ...(normalizedPhone.length >= 7 ? [{ phone: normalizedPhone }] : []),
      ],
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
    include: {
      vehicle: true,
    },
  });

  const grouped = classifyVisits(visits);

  return {
    currentVisit: grouped.current[0] ?? null,
    upcomingVisits: grouped.upcoming,
    pastVisits: grouped.past,
  };
}
