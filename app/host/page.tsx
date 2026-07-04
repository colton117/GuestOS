import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { approveVisitAction, denyVisitAction } from "@/lib/portal-actions";
import { getDashboardData } from "@/lib/admin-data";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function HostDashboardPage() {
  await requireAdminSession("/host");

  const { pendingRequests, guestsOnProperty, upcomingVisits } =
    await getDashboardData();

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <p className="gos-section-title text-[0.72rem] font-semibold">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
            Welcome back
          </h1>
        </div>

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

        <SectionCard title="Guests On Property">
          <div className="space-y-4">
            {guestsOnProperty.length === 0 ? (
              <p className="text-sm text-[color:var(--gos-muted)]">
                No guests currently on property.
              </p>
            ) : (
              guestsOnProperty.map((visit) => (
                <div key={visit.id} className="gos-panel gos-card-inner">
                  <div className="grid gap-3 md:grid-cols-3">
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
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Pending Requests">
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
    </AdminShell>
  );
}
