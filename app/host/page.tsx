import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { Modal } from "@/components/ui/modal";
import {
  approveVisitAction,
  denyVisitAction,
  updateVisitRequestAction,
} from "@/lib/portal-actions";
import { getDashboardData } from "@/lib/admin-data";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type HostDashboardPageProps = {
  searchParams?: Promise<{ visitEdit?: string }>;
};

export default async function HostDashboardPage({
  searchParams,
}: HostDashboardPageProps) {
  await requireAdminSession("/host");

  const { visitEdit } = (await searchParams) ?? {};
  const { pendingRequests, guestsOnProperty, upcomingVisits } =
    await getDashboardData();
  const editingVisit = visitEdit
    ? guestsOnProperty.find((visit) => visit.id === visitEdit)
    : null;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <p className="gos-section-title text-[0.72rem] font-semibold">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
            Welcome back
          </h1>
        </div>

        <SectionCard title="Current Visits">
          <div className="space-y-4">
            {guestsOnProperty.length === 0 ? (
              <p className="text-sm text-[color:var(--gos-muted)]">
                No guests currently on property.
              </p>
            ) : (
              guestsOnProperty.map((visit) => (
                <div key={visit.id} className="gos-panel gos-card-inner">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                        Guest
                      </p>
                      <p className="mt-1 text-sm font-medium text-[color:var(--gos-primary)]">
                        {visit.guest.firstName} {visit.guest.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                        Arrived
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--gos-text)]">
                        {visit.arrivalDateTime.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                        Vehicle
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--gos-text)]">
                        {visit.vehicle
                          ? `${visit.vehicle.year} ${visit.vehicle.make} ${visit.vehicle.model}`
                          : "—"}
                      </p>
                    </div>
                    <div className="flex xl:justify-end">
                      <Link
                        href={`/host?visitEdit=${visit.id}`}
                        className="gos-button-secondary px-3 py-2 text-xs"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Pending Requests" accent={pendingRequests.length > 0}>
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-[color:var(--gos-muted)]">
                No pending requests.
              </p>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="gos-panel gos-card-inner">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                        Guest
                      </p>
                      <p className="mt-1 text-sm font-medium text-[color:var(--gos-primary)]">
                        {request.guest.firstName} {request.guest.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                        Arrival
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--gos-text)]">
                        {request.arrivalDateTime.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                        Vehicle
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--gos-text)]">
                        {request.vehicle
                          ? `${request.vehicle.year} ${request.vehicle.make} ${request.vehicle.model}`
                          : "—"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <Link
                        href={`/requests/${request.id}`}
                        className="gos-button-secondary px-3 py-2 text-xs"
                      >
                        Edit
                      </Link>
                      <form action={approveVisitAction}>
                        <input type="hidden" name="visitId" value={request.id} />
                        <SubmitButton
                          pendingLabel="Approving…"
                          className="gos-button-primary px-3 py-2 text-xs"
                        >
                          Approve
                        </SubmitButton>
                      </form>
                      <form action={denyVisitAction}>
                        <input type="hidden" name="visitId" value={request.id} />
                        <SubmitButton
                          pendingLabel="Denying…"
                          className="gos-button-secondary px-3 py-2 text-xs"
                        >
                          Deny
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 text-right">
            <Link
              href="/requests"
              className="text-sm text-[color:var(--gos-muted)] underline underline-offset-4"
            >
              View all requests
            </Link>
          </div>
        </SectionCard>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="gos-panel gos-card-inner">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
              On Property
            </p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--gos-primary)]">
              {guestsOnProperty.length}
            </p>
          </div>
          <div className="gos-panel gos-card-inner">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
              Pending Requests
            </p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--gos-primary)]">
              {pendingRequests.length}
            </p>
          </div>
          <div className="gos-panel gos-card-inner">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
              Upcoming Visits
            </p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--gos-primary)]">
              {upcomingVisits.length}
            </p>
          </div>
        </div>

        <SectionCard title="Upcoming Visits">
          <div className="space-y-4">
            {upcomingVisits.length === 0 ? (
              <p className="text-sm text-[color:var(--gos-muted)]">
                No upcoming approved visits.
              </p>
            ) : (
              upcomingVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="gos-panel flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
                >
                  <span className="font-medium text-[color:var(--gos-primary)]">
                    {visit.guest.firstName} {visit.guest.lastName}
                  </span>
                  <span>{visit.arrivalDateTime.toLocaleString()}</span>
                  <span className="gos-badge">{visit.status}</span>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <Modal open={Boolean(editingVisit)} closeHref="/host" title="Edit Visit">
        {editingVisit ? (
          <form action={updateVisitRequestAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="visitId" value={editingVisit.id} />
            <input type="hidden" name="redirectTo" value="/host" />
            <label className="gos-label space-y-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Arrival Date &amp; Time
              </span>
              <input
                name="arrivalDateTime"
                type="datetime-local"
                defaultValue={editingVisit.arrivalDateTime.toISOString().slice(0, 16)}
                className="gos-input text-sm"
              />
            </label>
            <label className="gos-label space-y-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Departure Date &amp; Time
              </span>
              <input
                name="departureDateTime"
                type="datetime-local"
                defaultValue={
                  editingVisit.departureDateTime
                    ? editingVisit.departureDateTime.toISOString().slice(0, 16)
                    : ""
                }
                className="gos-input text-sm"
              />
            </label>
            <label className="gos-label space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Vehicle
              </span>
              <select
                name="vehicleId"
                defaultValue={editingVisit.vehicleId ?? ""}
                className="gos-input text-sm"
              >
                <option value="">No vehicle selected</option>
                {editingVisit.guest.vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.plate}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
              <label className="flex items-center gap-3 rounded-lg border border-[rgba(31,46,39,0.12)] px-4 py-3">
                <input
                  type="checkbox"
                  name="parkingRequired"
                  defaultChecked={editingVisit.parkingRequired}
                />
                <span>Parking Required</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-[rgba(31,46,39,0.12)] px-4 py-3">
                <input
                  type="checkbox"
                  name="buildingAccessRequired"
                  defaultChecked={editingVisit.buildingAccessRequired}
                />
                <span>Building Access Required</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-[rgba(31,46,39,0.12)] px-4 py-3">
                <input
                  type="checkbox"
                  name="apartmentAccessRequired"
                  defaultChecked={editingVisit.apartmentAccessRequired}
                />
                <span>Apartment Access Required</span>
              </label>
            </div>
            <label className="gos-label space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Request Notes
              </span>
              <textarea
                name="requestNotes"
                rows={4}
                defaultValue={editingVisit.requestNotes ?? ""}
                className="gos-input text-sm"
              />
            </label>
            <div className="md:col-span-2">
              <SubmitButton
                pendingLabel="Saving…"
                className="gos-button-primary w-full text-sm sm:w-auto"
              >
                Save Visit
              </SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>
    </AdminShell>
  );
}
