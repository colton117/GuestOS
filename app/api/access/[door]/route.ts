import { NextResponse } from "next/server";
import {
  ACCESS_UNAUTHORIZED_REASON,
  ACCESS_UNAVAILABLE_REASON,
  createGuestAccessService,
} from "@/lib/access";
import { isAccessPointSlug } from "@/lib/access-definitions";
import { getCurrentGuestId } from "@/lib/portal";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AccessRouteParams = {
  params: Promise<{
    door: string;
  }>;
};

function jsonFailure(
  record: {
    timestamp: string;
    guestId: string | null;
    visitId: string | null;
    door: string;
    success: boolean;
    reason: string;
  },
  status: number,
) {
  return NextResponse.json(record, { status });
}

function logAccessAttempt(record: {
  timestamp: string;
  guestId: string | null;
  visitId: string | null;
  door: string;
  success: boolean;
  reason: string;
}) {
  console.info("[GuestOS Access]", record);
}

export async function POST(_: Request, { params }: AccessRouteParams) {
  const resolvedParams = await params;
  const door = resolvedParams.door.trim();
  const timestamp = new Date().toISOString();

  if (!isAccessPointSlug(door)) {
    return jsonFailure(
      {
        timestamp,
        guestId: null,
        visitId: null,
        door,
        success: false,
        reason: ACCESS_UNAUTHORIZED_REASON,
      },
      404,
    );
    logAccessAttempt({
      timestamp,
      guestId: null,
      visitId: null,
      door,
      success: false,
      reason: ACCESS_UNAUTHORIZED_REASON,
    });
  }

  const guestId = await getCurrentGuestId();

  if (!guestId) {
    return jsonFailure(
      {
        timestamp,
        guestId: null,
        visitId: null,
        door,
        success: false,
        reason: ACCESS_UNAUTHORIZED_REASON,
      },
      401,
    );
    logAccessAttempt({
      timestamp,
      guestId: null,
      visitId: null,
      door,
      success: false,
      reason: ACCESS_UNAUTHORIZED_REASON,
    });
  }

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
  });

  if (!guest) {
    return jsonFailure(
      {
        timestamp,
        guestId,
        visitId: null,
        door,
        success: false,
        reason: ACCESS_UNAUTHORIZED_REASON,
      },
      401,
    );
    logAccessAttempt({
      timestamp,
      guestId,
      visitId: null,
      door,
      success: false,
      reason: ACCESS_UNAUTHORIZED_REASON,
    });
  }

  try {
    const accessService = createGuestAccessService();
    const result = await accessService.openAccessPoint(door, guest.id);
    return jsonFailure(result.record, result.status);
  } catch (error) {
    console.error("[GuestOS Access] Access route initialization failed.", error);

    return jsonFailure(
      {
        timestamp,
        guestId: guest.id,
        visitId: null,
        door,
        success: false,
        reason: ACCESS_UNAVAILABLE_REASON,
      },
      503,
    );
  }
}
