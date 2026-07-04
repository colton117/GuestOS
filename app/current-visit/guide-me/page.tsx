import { redirect } from "next/navigation";
import { GuideMeExperience } from "@/components/guide-me-experience";
import { PortalShell } from "@/components/portal-shell";
import { getGuestBranding } from "@/lib/branding";
import { getCurrentGuest, getGuestVisitState } from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function GuideMePage() {
  const guest = await getCurrentGuest();

  if (!guest) {
    redirect("/login");
  }

  const visitState = await getGuestVisitState(guest.id);

  if (visitState.kind === "no_visit") {
    redirect("/request-visit");
  }

  if (visitState.kind === "pending_visit_request" || !visitState.visit) {
    redirect("/current-visit");
  }

  const branding = await getGuestBranding();
  const propertyName = branding.welcomeMessage ?? "4123 Cedar Springs";

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <GuideMeExperience
        guestId={guest.id}
        visitId={visitState.visit.id}
        guestName={`${guest.firstName} ${guest.lastName}`}
        propertyName={propertyName}
        arrivalDateTime={visitState.visit.arrivalDateTime.toISOString()}
      />
    </PortalShell>
  );
}
