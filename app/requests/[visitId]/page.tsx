import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { SectionCard } from "@/components/section-card";
import { getPendingRequests } from "@/lib/admin-data";
import { updateVisitRequestAction } from "@/lib/portal-actions";

export const dynamic = "force-dynamic";

type RequestEditPageProps = {
  params: Promise<{
    visitId: string;
  }>;
};

export default async function RequestEditPage({ params }: RequestEditPageProps) {
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
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Requests
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Edit pending request
          </h1>
        </div>

        <SectionCard title="Request Details">
          <form action={updateVisitRequestAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="visitId" value={request.id} />
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Arrival Date & Time
              </span>
              <input
                name="arrivalDateTime"
                type="datetime-local"
                defaultValue={request.arrivalDateTime.toISOString().slice(0, 16)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Departure Date & Time
              </span>
              <input
                name="departureDateTime"
                type="datetime-local"
                defaultValue={
                  request.departureDateTime
                    ? request.departureDateTime.toISOString().slice(0, 16)
                    : ""
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Vehicle
              </span>
              <select
                name="vehicleId"
                defaultValue={request.vehicleId ?? ""}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
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
              <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                <input
                  type="checkbox"
                  name="parkingRequired"
                  defaultChecked={request.parkingRequired}
                />
                <span>Parking Required</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                <input
                  type="checkbox"
                  name="buildingAccessRequired"
                  defaultChecked={request.buildingAccessRequired}
                />
                <span>Building Access Required</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                <input
                  type="checkbox"
                  name="apartmentAccessRequired"
                  defaultChecked={request.apartmentAccessRequired}
                />
                <span>Apartment Access Required</span>
              </label>
            </div>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                Request Notes
              </span>
              <textarea
                name="requestNotes"
                rows={4}
                defaultValue={request.requestNotes ?? ""}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
              />
            </label>
            <div className="md:col-span-2">
              <button className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                Save Request
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </AdminShell>
  );
}
