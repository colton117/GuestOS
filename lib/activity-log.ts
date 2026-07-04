import { prisma } from "@/lib/prisma";

export async function logActivity(guestId: string, message: string) {
  await prisma.activityLog.create({
    data: { guestId, message },
  });
}

export async function getGuestActivityLog(guestId: string) {
  return prisma.activityLog.findMany({
    where: { guestId },
    orderBy: [{ createdAt: "desc" }],
  });
}
