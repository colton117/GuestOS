import { getVisits } from "@/lib/admin-data";
import { SectionCard } from "@/components/section-card";

export const dynamic = "force-dynamic";

export default async function VisitsPage() {
  const visits = await getVisits();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Visits
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Visit schedule
        </h1>
      </div>

      <SectionCard title="All Visits">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Arrival</th>
                <th className="px-4 py-3">Departure</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-sm text-slate-500">
                    No visits found.
                  </td>
                </tr>
              ) : (
                visits.map((visit) => (
                  <tr key={visit.id} className="text-sm text-slate-700">
                    <td className="px-4 py-4 font-medium text-slate-950">
                      {visit.guest.firstName} {visit.guest.lastName}
                    </td>
                    <td className="px-4 py-4">
                      {visit.arrivalDateTime.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      {visit.departureDateTime
                        ? visit.departureDateTime.toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-4">{visit.status}</td>
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
