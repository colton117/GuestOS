import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { SmsConsentCheckbox } from "@/components/sms-consent-checkbox";
import { getGuestVehicles, requireCurrentGuest } from "@/lib/portal";
import { requestVisitAction } from "@/lib/portal-actions";

export const dynamic = "force-dynamic";

export default async function RequestVisitPage() {
  const guest = await requireCurrentGuest();
  const vehicles = await getGuestVehicles(guest.id);
  const defaultVehicle =
    vehicles.find((vehicle) => vehicle.isDefault) ?? vehicles[0];

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Request Visit
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Request a new visit
          </h1>
        </div>

        <SectionCard title="Visit Request">
          {vehicles.length === 0 ? (
            <div className="space-y-3 text-sm text-slate-600">
              <p>Add a vehicle before requesting a visit.</p>
              <Link
                href="/vehicles"
                className="inline-flex rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white"
              >
                Add Vehicle
              </Link>
            </div>
          ) : (
            <form action={requestVisitAction} className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Arrival Date & Time
                </span>
                <input
                  name="arrivalDateTime"
                  type="datetime-local"
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Vehicle</span>
                <select
                  name="vehicleId"
                  defaultValue={defaultVehicle?.id ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                >
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.isDefault ? "Default - " : ""}
                      {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.plate}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="parkingRequired" defaultChecked />
                <span className="text-sm text-slate-700">Parking Required</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="buildingAccessRequired" defaultChecked />
                <span className="text-sm text-slate-700">Building Access Required</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="apartmentAccessRequired" defaultChecked />
                <span className="text-sm text-slate-700">Apartment Access Required</span>
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  Request Notes
                </span>
                <textarea
                  name="requestNotes"
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <div className="md:col-span-2">
                <SmsConsentCheckbox />
              </div>
              <div className="md:col-span-2">
                <button className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                  Submit Request
                </button>
              </div>
            </form>
          )}
        </SectionCard>
      </div>
    </PortalShell>
  );
}
