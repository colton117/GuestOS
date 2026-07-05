import { redirect } from "next/navigation";
import { CurrentVisitAccessActions } from "@/components/current-visit-access-actions";
import { CurrentVisitTabs } from "@/components/current-visit-tabs";
import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { getCurrentGuest, getGuestVisitState } from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function CurrentVisitAccessPage() {
  const guest = await getCurrentGuest();

  if (!guest) {
    redirect("/login");
  }

  const state = await getGuestVisitState(guest.id);

  if (state.kind === "no_visit") {
    redirect("/request-visit");
  }

  if (state.kind === "pending_visit_request") {
    redirect("/current-visit");
  }

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <div className="space-y-6 lg:space-y-8">
        <CurrentVisitTabs />

        <section className="gos-card p-6 sm:p-8">
          <p className="gos-badge gos-scale-in">Current Visit</p>
          <div className="mt-4 space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-4xl">
              Access
            </h1>
            <p className="max-w-3xl text-base leading-7 text-[color:var(--gos-muted)]">
              Open doors and gates for your stay.
            </p>
          </div>
        </section>

        <SectionCard title="Access Points">
          <CurrentVisitAccessActions />
        </SectionCard>
      </div>
    </PortalShell>
  );
}
