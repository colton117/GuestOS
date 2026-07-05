import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { approveVisitAction, denyVisitAction } from "@/lib/portal-actions";
import { getPendingRequests, getRequestHistory } from "@/lib/admin-data";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function historyStatusTone(status: string) {
  switch (status) {
    case "APPROVED":
    case "ACTIVE":
    case "COMPLETED":
      return "bg-[rgba(62,107,78,0.12)] text-[color:var(--gos-success)]";
    case "DENIED":
      return "bg-[rgba(166,70,70,0.12)] text-[color:var(--gos-error)]";
    default:
      return "bg-[rgba(31,46,39,0.08)] text-[color:var(--gos-primary)]";
  }
}

export default async function RequestsPage() {
  await requireAdminSession("/requests");

  const [requests, history] = await Promise.all([
    getPendingRequests(),
    getRequestHistory(),
  ]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <p className="gos-section-title text-[0.72rem] font-semibold">
            Requests
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
            Pending visitor requests
          </h1>
        </div>

        <SectionCard title="Pending Requests">
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-sm text-[color:var(--gos-muted)]">
                No pending requests.
              </p>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="gos-panel gos-card-inner"
                >
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
                        Status
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--gos-text)]">
                        {request.status}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 xl:flex xl:flex-wrap xl:justify-end">
                      <Link
                        href={`/requests/${request.id}`}
                        className="gos-button-secondary min-h-[44px] px-3 py-2 text-xs"
                      >
                        Edit
                      </Link>
                      <form action={approveVisitAction} className="contents">
                        <input type="hidden" name="visitId" value={request.id} />
                        <SubmitButton
                          pendingLabel="Approving…"
                          className="gos-button-primary min-h-[44px] px-3 py-2 text-xs"
                        >
                          Approve
                        </SubmitButton>
                      </form>
                      <form action={denyVisitAction} className="contents">
                        <input type="hidden" name="visitId" value={request.id} />
                        <SubmitButton
                          pendingLabel="Denying…"
                          className="gos-button-secondary min-h-[44px] px-3 py-2 text-xs"
                        >
                          Deny
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-[color:var(--gos-text)] md:grid-cols-3">
                    <p>
                      <span className="font-medium text-[color:var(--gos-primary)]">
                        Access:
                      </span>{" "}
                      {[
                        request.buildingAccessRequired ? "Building" : null,
                        request.apartmentAccessRequired ? "Apartment" : null,
                        request.parkingRequired ? "Parking" : null,
                      ]
                        .filter(Boolean)
                        .join(", ") || "None"}
                    </p>
                    <p>
                      <span className="font-medium text-[color:var(--gos-primary)]">
                        Vehicle:
                      </span>{" "}
                      {request.vehicle
                        ? `${request.vehicle.year} ${request.vehicle.make} ${request.vehicle.model}`
                        : "—"}
                    </p>
                    <p>
                      <span className="font-medium text-[color:var(--gos-primary)]">
                        Notes:
                      </span>{" "}
                      {request.requestNotes || "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Request History">
          {history.length === 0 ? (
            <p className="text-sm text-[color:var(--gos-muted)]">
              No past requests yet.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((visit) => (
                <div
                  key={visit.id}
                  className="gos-panel flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
                >
                  <span className="font-medium text-[color:var(--gos-primary)]">
                    {visit.guest.firstName} {visit.guest.lastName}
                  </span>
                  <span className="text-[color:var(--gos-muted)]">
                    {visit.arrivalDateTime.toLocaleString()}
                  </span>
                  <span className="text-[color:var(--gos-muted)]">
                    {visit.vehicle
                      ? `${visit.vehicle.year} ${visit.vehicle.make} ${visit.vehicle.model}`
                      : "—"}
                  </span>
                  <span className={`gos-badge ${historyStatusTone(visit.status)}`}>
                    {visit.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AdminShell>
  );
}
