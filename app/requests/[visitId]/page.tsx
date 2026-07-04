import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { getPendingRequests } from "@/lib/admin-data";
import { updateVisitRequestAction } from "@/lib/portal-actions";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type RequestEditPageProps = {
  params: Promise<{
    visitId: string;
  }>;
};

export default async function RequestEditPage({ params }: RequestEditPageProps) {
  await requireAdminSession("/requests");

  const { visitId } = await params;
  const requests = await getPendingRequests();
  const request = requests.find((entry) => entry.id === visitId);

  if (!request) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <p className="gos-section-title text-[0.72rem] font-semibold">
            Requests
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
            Edit pending request
          </h1>
        </div>

        <SectionCard title="Request Details">
          <form action={updateVisitRequestAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="visitId" value={request.id} />
            <label className="gos-label space-y-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Arrival Date &amp; Time
              </span>
              <input
                name="arrivalDateTime"
                type="datetime-local"
                defaultValue={request.arrivalDateTime.toISOString().slice(0, 16)}
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
                  request.departureDateTime
                    ? request.departureDateTime.toISOString().slice(0, 16)
                    : ""
                }
                className="gos-input text-sm"
              />
            </label>
            <label className="gos-label space-y-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Vehicle
              </span>
              <select
                name="vehicleId"
                defaultValue={request.vehicleId ?? ""}
                className="gos-input text-sm"
              >
                <option value="">No vehicle selected</option>
                {request.guest.vehicles.map((vehicle) => (
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
                  defaultChecked={request.parkingRequired}
                />
                <span>Parking Required</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-[rgba(31,46,39,0.12)] px-4 py-3">
                <input
                  type="checkbox"
                  name="buildingAccessRequired"
                  defaultChecked={request.buildingAccessRequired}
                />
                <span>Building Access Required</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-[rgba(31,46,39,0.12)] px-4 py-3">
                <input
                  type="checkbox"
                  name="apartmentAccessRequired"
                  defaultChecked={request.apartmentAccessRequired}
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
                defaultValue={request.requestNotes ?? ""}
                className="gos-input text-sm"
              />
            </label>
            <div className="md:col-span-2">
              <SubmitButton
                pendingLabel="Saving…"
                className="gos-button-primary w-full text-sm sm:w-auto"
              >
                Save Request
              </SubmitButton>
            </div>
          </form>
        </SectionCard>
      </div>
    </AdminShell>
  );
}
