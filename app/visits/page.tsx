import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { getGuestVisits, requireCurrentGuest } from "@/lib/portal";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return value.toLocaleString();
}

export default async function VisitsPage() {
  const guest = await requireCurrentGuest();
  const visits = await getGuestVisits(guest.id);

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Visits
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Visit history
          </h1>
        </div>

        <SectionCard title="Current">
          <div className="space-y-3">
            {visits.current.length === 0 ? (
              <p className="text-sm text-slate-600">No current visits.</p>
            ) : (
              visits.current.map((visit) => (
                <div
                  key={visit.id}
                  className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700"
                >
                  <div className="grid gap-2 md:grid-cols-2">
                    <p>
                      <span className="font-medium text-slate-950">Arrival:</span>{" "}
                      {formatDate(visit.arrivalDateTime)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">
                        Departure:
                      </span>{" "}
                      {visit.departureDateTime
                        ? formatDate(visit.departureDateTime)
                        : "—"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">
                        Parking Status:
                      </span>{" "}
                      {visit.parkingRequired ? "Required" : "Not required"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">
                        Building Access:
                      </span>{" "}
                      {visit.buildingAccessRequired ? "Required" : "Not required"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">
                        Apartment Access:
                      </span>{" "}
                      {visit.apartmentAccessRequired ? "Required" : "Not required"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">Status:</span>{" "}
                      {visit.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Upcoming">
          <div className="space-y-3">
            {visits.upcoming.length === 0 ? (
              <p className="text-sm text-slate-600">No upcoming visits.</p>
            ) : (
              visits.upcoming.map((visit) => (
                <div
                  key={visit.id}
                  className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700"
                >
                  <div className="grid gap-2 md:grid-cols-2">
                    <p>
                      <span className="font-medium text-slate-950">Arrival:</span>{" "}
                      {formatDate(visit.arrivalDateTime)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">
                        Departure:
                      </span>{" "}
                      {visit.departureDateTime
                        ? formatDate(visit.departureDateTime)
                        : "—"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">
                        Parking Status:
                      </span>{" "}
                      {visit.parkingRequired ? "Required" : "Not required"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">
                        Building Access:
                      </span>{" "}
                      {visit.buildingAccessRequired ? "Required" : "Not required"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">
                        Apartment Access:
                      </span>{" "}
                      {visit.apartmentAccessRequired ? "Required" : "Not required"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">Status:</span>{" "}
                      {visit.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Past">
          <div className="space-y-3">
            {visits.past.length === 0 ? (
              <p className="text-sm text-slate-600">No past visits.</p>
            ) : (
              visits.past.map((visit) => (
                <div
                  key={visit.id}
                  className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700"
                >
                  <div className="grid gap-2 md:grid-cols-2">
                    <p>
                      <span className="font-medium text-slate-950">Arrival:</span>{" "}
                      {formatDate(visit.arrivalDateTime)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">
                        Departure:
                      </span>{" "}
                      {visit.departureDateTime
                        ? formatDate(visit.departureDateTime)
                        : "—"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">
                        Parking Status:
                      </span>{" "}
                      {visit.parkingRequired ? "Required" : "Not required"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">
                        Building Access:
                      </span>{" "}
                      {visit.buildingAccessRequired ? "Required" : "Not required"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">
                        Apartment Access:
                      </span>{" "}
                      {visit.apartmentAccessRequired ? "Required" : "Not required"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">Status:</span>{" "}
                      {visit.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </PortalShell>
  );
}
