import { prisma } from "@/lib/prisma";
import { getAllGuideSteps } from "@/lib/guide-me";

function toPhotoSrc(
  photoData: Uint8Array | null | undefined,
  photoMimeType: string | null | undefined,
): string | null {
  if (!photoData || !photoMimeType) {
    return null;
  }

  return `data:${photoMimeType};base64,${Buffer.from(photoData).toString("base64")}`;
}

/** stepId -> photo data URI (or null if none set), for the guide-me step viewer. */
export async function getGuidePointPhotos(): Promise<Record<string, string | null>> {
  const points = await prisma.guidePoint.findMany();
  const byStepId = new Map(points.map((point) => [point.stepId, point]));

  const photos: Record<string, string | null> = {};
  for (const step of getAllGuideSteps()) {
    const point = byStepId.get(step.stepId);
    photos[step.stepId] = point ? toPhotoSrc(point.photoData, point.photoMimeType) : null;
  }

  return photos;
}

/** Every guide-me step paired with its current reference photo (if any), for the admin management UI. */
export async function getGuidePointsForAdmin() {
  const points = await prisma.guidePoint.findMany();
  const byStepId = new Map(points.map((point) => [point.stepId, point]));

  return getAllGuideSteps().map((step) => {
    const point = byStepId.get(step.stepId);
    return {
      ...step,
      photoSrc: point ? toPhotoSrc(point.photoData, point.photoMimeType) : null,
    };
  });
}
