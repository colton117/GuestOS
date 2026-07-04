import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { PropertyMapEngine } from "@/components/property-map-engine";
import { getGuestBranding } from "@/lib/branding";
import { getCurrentGuest, getGuestVisitState } from "@/lib/portal";
import { propertyMapFloors } from "@/lib/property-map";

export const dynamic = "force-dynamic";

export default async function PropertyMapPage() {
  const guest = await getCurrentGuest();

  if (!guest) {
    redirect("/login");
  }

  const branding = await getGuestBranding();
  const state = await getGuestVisitState(guest.id);

  if (state.kind === "no_visit") {
    redirect("/request-visit");
  }

  if (state.kind === "pending_visit_request") {
    redirect("/current-visit");
  }

  const guestName = `${guest.firstName} ${guest.lastName}`;
  const propertyName = branding.welcomeMessage ?? "4123 Cedar Springs";

  return (
    <PortalShell guestName={guestName}>
      <div className="space-y-6 lg:space-y-8">
        <section className="gos-card p-6 sm:p-8">
          <p className="gos-badge gos-scale-in">Current Visit</p>
          <div className="mt-4 space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-4xl">
              Property Map
            </h1>
            <p className="max-w-3xl text-base leading-7 text-[color:var(--gos-muted)]">
              Find your way around {propertyName}. Switch floors, tap a point of interest, and get
              directions to where you&apos;re headed.
            </p>
          </div>
        </section>

        <PropertyMapEngine
          floors={propertyMapFloors}
          initialFloorId="garage-level-1"
          guestName={guestName}
          propertyName={propertyName}
        />
      </div>
    </PortalShell>
  );
}

