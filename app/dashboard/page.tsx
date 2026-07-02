import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { getDashboardSummary, requireCurrentGuest } from "@/lib/portal";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return value.toLocaleString();
}

export default async function DashboardPage() {
  const guest = await requireCurrentGuest();
  const summary = await getDashboardSummary(guest.id);

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Welcome back
            </h1>
          </div>
          <Link
            href="/request-visit"
            className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white"
          >
            Request New Visit
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard title="Current Visit">
            {summary.currentVisit ? (
              <div className="space-y-2 text-sm text-slate-700">
                <p className="font-medium text-slate-950">
                  {formatDate(summary.currentVisit.arrivalDateTime)}
                </p>
                <p>
                  Departure:{" "}
                  {summary.currentVisit.departureDateTime
                    ? formatDate(summary.currentVisit.departureDateTime)
                    : "—"}
                </p>
                <p>Status: {summary.currentVisit.status}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-600">No active visits.</p>
            )}
          </SectionCard>

          <SectionCard title="Upcoming Visits">
            <div className="space-y-3">
              {summary.upcomingVisits.length === 0 ? (
                <p className="text-sm text-slate-600">No upcoming visits.</p>
              ) : (
                summary.upcomingVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700"
                  >
                    <p className="font-medium text-slate-950">
                      {formatDate(visit.arrivalDateTime)}
                    </p>
                    <p>Status: {visit.status}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Past Visits">
            <div className="space-y-3">
              {summary.pastVisits.length === 0 ? (
                <p className="text-sm text-slate-600">No past visits.</p>
              ) : (
                summary.pastVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700"
                  >
                    <p className="font-medium text-slate-950">
                      {formatDate(visit.arrivalDateTime)}
                    </p>
                    <p>Status: {visit.status}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </PortalShell>
  );
}
