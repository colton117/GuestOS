"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { isValidGuestEmail, isValidGuestPhone, normalizeGuestEmail, normalizeGuestPhone } from "@/lib/portal";

export async function adminUpdateGuestAction(formData: FormData) {
  await requireAdminSession("/guests");

  const guestId = String(formData.get("guestId") ?? "");

  if (!guestId) {
    redirect("/guests");
  }

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = normalizeGuestEmail(String(formData.get("email") ?? ""));
  const phone = normalizeGuestPhone(String(formData.get("phone") ?? ""));

  if (!firstName || !lastName || !isValidGuestEmail(email) || !isValidGuestPhone(phone)) {
    redirect(`/guests/${guestId}?edit=1&error=invalid`);
  }

  await prisma.guest.update({
    where: { id: guestId },
    data: { firstName, lastName, email, phone },
  });

  revalidatePath("/guests");
  revalidatePath(`/guests/${guestId}`);
  redirect(`/guests/${guestId}`);
}
