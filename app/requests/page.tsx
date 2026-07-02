import { getPendingRequests } from "@/lib/admin-data";
import { SectionCard } from "@/components/section-card";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const requests = await getPendingRequests();

  return (
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Arrival</th>
                <th className="px-4 py-3">Access</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-sm text-slate-500">
                    No pending requests.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="text-sm text-slate-700">
                    <td className="px-4 py-4 font-medium text-slate-950">
                      {request.guest.firstName} {request.guest.lastName}
                    </td>
                    <td className="px-4 py-4">
                      {request.arrivalDateTime.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      {[
                        request.buildingAccessRequired ? "Building" : null,
                        request.apartmentAccessRequired ? "Apartment" : null,
                        request.parkingRequired ? "Parking" : null,
                      ]
                        .filter(Boolean)
                        .join(", ") || "None"}
                    </td>
                    <td className="px-4 py-4">{request.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
