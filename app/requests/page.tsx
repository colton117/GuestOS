import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { SectionCard } from "@/components/section-card";
import { approveVisitAction, denyVisitAction } from "@/lib/portal-actions";
import { getPendingRequests } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const requests = await getPendingRequests();

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Requests
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Pending visitor requests
          </h1>
        </div>

        <SectionCard title="Pending Requests">
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-sm text-slate-500">No pending requests.</p>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Guest
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-950">
                        {request.guest.firstName} {request.guest.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Arrival
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {request.arrivalDateTime.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Status
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {request.status}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <Link
                        href={`/requests/${request.id}`}
                        className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        Edit
                      </Link>
                      <form action={approveVisitAction}>
                        <input type="hidden" name="visitId" value={request.id} />
                        <button className="rounded-md border border-slate-950 bg-slate-950 px-3 py-2 text-xs font-medium text-white">
                          Approve
                        </button>
                      </form>
                      <form action={denyVisitAction}>
                        <input type="hidden" name="visitId" value={request.id} />
                        <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700">
                          Deny
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                    <p>
                      <span className="font-medium text-slate-900">Access:</span>{" "}
                      {[
                        request.buildingAccessRequired ? "Building" : null,
                        request.apartmentAccessRequired ? "Apartment" : null,
                        request.parkingRequired ? "Parking" : null,
                      ]
                        .filter(Boolean)
                        .join(", ") || "None"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Vehicle:</span>{" "}
                      {request.vehicle
                        ? `${request.vehicle.year} ${request.vehicle.make} ${request.vehicle.model}`
                        : "—"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Notes:</span>{" "}
                      {request.requestNotes || "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </AdminShell>
  );
}
