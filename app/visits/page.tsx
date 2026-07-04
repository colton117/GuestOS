import { Clock3, MapPin, ShieldCheck } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { getGuestVisits, requireCurrentGuest } from "@/lib/portal";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return value.toLocaleString();
}

function statusTone(status: string) {
  switch (status) {
    case "APPROVED":
    case "ACTIVE":
      return "bg-[rgba(62,107,78,0.12)] text-[color:var(--gos-success)]";
    case "PENDING":
      return "bg-[rgba(184,138,46,0.14)] text-[color:var(--gos-warning)]";
    case "DENIED":
      return "bg-[rgba(166,70,70,0.12)] text-[color:var(--gos-error)]";
    default:
      return "bg-[rgba(31,46,39,0.08)] text-[color:var(--gos-primary)]";
  }
}

export default async function VisitsPage() {
  const guest = await requireCurrentGuest();
  const visits = await getGuestVisits(guest.id);

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <div className="space-y-6 lg:space-y-8">
        <section className="gos-card overflow-hidden gos-fade-in">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <p className="gos-badge">History</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-5xl">
              Elegant visit timeline
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--gos-muted)]">
              Review upcoming stays, active visits, and past arrivals in one calm timeline.
            </p>
          </div>
        </section>

        <SectionCard title="Current">
          <Timeline visits={visits.current} emptyText="No current visits." />
        </SectionCard>

        <SectionCard title="Upcoming">
          <Timeline visits={visits.upcoming} emptyText="No upcoming visits." />
        </SectionCard>

        <SectionCard title="Past">
          <Timeline visits={visits.past} emptyText="No past visits." />
        </SectionCard>
      </div>
    </PortalShell>
  );
}

function Timeline({
  visits,
  emptyText,
}: {
  visits: Array<{
    id: string;
    arrivalDateTime: Date;
    departureDateTime: Date | null;
    parkingRequired: boolean;
    buildingAccessRequired: boolean;
    apartmentAccessRequired: boolean;
    status: string;
  }>;
  emptyText: string;
}) {
  if (visits.length === 0) {
    return (
      <div className="gos-panel flex items-start gap-4 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-[rgba(31,46,39,0.06)]">
          <Clock3 className="h-6 w-6 text-[color:var(--gos-primary)]" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-[color:var(--gos-primary)]">
            No visits yet
          </p>
          <p className="text-sm leading-6 text-[color:var(--gos-muted)]">{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visits.map((visit) => (
        <article key={visit.id} className="gos-panel p-5 gos-fade-in">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={`gos-badge ${statusTone(visit.status)}`}>
                  {visit.status}
                </span>
                <span className="text-sm text-[color:var(--gos-muted)]">
                  {formatDate(visit.arrivalDateTime)}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat icon={Clock3} label="Arrival" value={formatDate(visit.arrivalDateTime)} />
                <Stat icon={MapPin} label="Departure" value={visit.departureDateTime ? formatDate(visit.departureDateTime) : "—"} />
                <Stat
                  icon={ShieldCheck}
                  label="Access"
                  value={[
                    visit.parkingRequired ? "Parking" : null,
                    visit.buildingAccessRequired ? "Building" : null,
                    visit.apartmentAccessRequired ? "Apartment" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "None"}
                />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] bg-[rgba(31,46,39,0.04)] p-4 transition-transform duration-[180ms] hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-[color:var(--gos-accent)]" />
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm leading-6 text-[color:var(--gos-text)]">{value}</p>
    </div>
  );
}
