import { redirect } from "next/navigation";
import { CurrentVisitCountdown } from "@/components/current-visit-countdown";
import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { cancelVisitRequestAction } from "@/lib/portal-actions";
import { getCurrentGuest, getGuestVisitState } from "@/lib/portal";

export const dynamic = "force-dynamic";

function formatDateTime(value: Date | null | undefined) {
  return value ? value.toLocaleString() : "—";
}

function renderVehicleLabel(
  vehicle:
    | {
        year: number;
        make: string;
        model: string;
        plate: string;
      }
    | null
    | undefined,
) {
  if (!vehicle) {
    return null;
  }

  return `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.plate}`;
}

export default async function CurrentVisitPage() {
  const guest = await getCurrentGuest();

  if (!guest) {
    redirect("/login");
  }

  const state = await getGuestVisitState(guest.id);

  if (state.kind === "no_visit") {
    redirect("/request-visit");
  }

  const visit = state.visit;

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Current Visit
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {state.kind === "pending_visit_request"
              ? "Pending Approval"
              : "Your current visit"}
          </h1>
        </div>

        {state.kind === "pending_visit_request" && visit ? (
          <SectionCard title="Pending Approval">
            <div className="space-y-4 text-sm text-slate-700">
              <p className="text-slate-800">
                Your visit request has been submitted and is awaiting host approval.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <p>
                  <span className="font-medium text-slate-950">Submitted:</span>{" "}
                  {formatDateTime(visit.createdAt)}
                </p>
                <p>
                  <span className="font-medium text-slate-950">Arrival:</span>{" "}
                  {formatDateTime(visit.arrivalDateTime)}
                </p>
                <p>
                  <span className="font-medium text-slate-950">Departure:</span>{" "}
                  {formatDateTime(visit.departureDateTime)}
                </p>
                <p>
                  <span className="font-medium text-slate-950">Vehicle:</span>{" "}
                  {renderVehicleLabel(visit.vehicle) ?? "—"}
                </p>
                <p>
                  <span className="font-medium text-slate-950">Parking:</span>{" "}
                  {visit.parkingRequired ? "Required" : "Not required"}
                </p>
                <p>
                  <span className="font-medium text-slate-950">
                    Building Access:
                  </span>{" "}
                  {visit.buildingAccessRequired ? "Required" : "Not required"}
                </p>
                <p className="md:col-span-2">
                  <span className="font-medium text-slate-950">
                    Host notification:
                  </span>{" "}
                  Your host has been notified and will review the request shortly.
                </p>
              </div>
              <form action={cancelVisitRequestAction}>
                <input type="hidden" name="visitId" value={visit.id} />
                <button className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">
                  Cancel Request
                </button>
              </form>
            </div>
          </SectionCard>
        ) : null}

        {visit && state.kind !== "pending_visit_request" ? (
          <div className="space-y-4">
            <SectionCard title="Visit Status">
              <div className="space-y-2 text-sm text-slate-700">
                <p className="font-medium text-slate-950">
                  {state.kind === "active_visit" ? "Active Visit" : "Approved Visit"}
                </p>
                {state.kind === "upcoming_approved_visit" ? (
                  <p className="text-slate-700">
                    <CurrentVisitCountdown
                      arrivalDateTime={visit.arrivalDateTime.toISOString()}
                    />
                  </p>
                ) : null}
              </div>
            </SectionCard>

            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard title="Arrival">
                <p className="text-sm text-slate-700">
                  {formatDateTime(visit.arrivalDateTime)}
                </p>
              </SectionCard>

              {visit.departureDateTime ? (
                <SectionCard title="Departure">
                  <p className="text-sm text-slate-700">
                    {formatDateTime(visit.departureDateTime)}
                  </p>
                </SectionCard>
              ) : null}

              <SectionCard title="Vehicle">
                <p className="text-sm text-slate-700">
                  {renderVehicleLabel(visit.vehicle) ?? "No vehicle assigned."}
                </p>
              </SectionCard>

              <SectionCard title="Parking">
                <p className="text-sm text-slate-700">
                  {visit.parkingRequired ? "Parking required." : "Parking not required."}
                </p>
              </SectionCard>

              <SectionCard title="Building Access">
                <p className="text-sm text-slate-700">
                  {visit.buildingAccessRequired
                    ? "Building access required."
                    : "Building access not required."}
                </p>
              </SectionCard>

              {visit.requestNotes ? (
                <SectionCard title="Guest Notes">
                  <p className="text-sm text-slate-700">{visit.requestNotes}</p>
                </SectionCard>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </PortalShell>
  );
}
