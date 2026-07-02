import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import {
  addVehicleAction,
  deleteVehicleAction,
  setDefaultVehicleAction,
  updateVehicleAction,
} from "@/lib/portal-actions";
import { getGuestVehicles, requireCurrentGuest } from "@/lib/portal";

export const dynamic = "force-dynamic";

type VehiclesPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const guest = await requireCurrentGuest();
  const params = (await searchParams) ?? {};
  const vehicles = await getGuestVehicles(guest.id);
  const editingVehicle = params.edit
    ? vehicles.find((vehicle) => vehicle.id === params.edit)
    : null;

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Vehicles
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Saved vehicles
            </h1>
          </div>
        </div>

        <SectionCard title="Vehicle List">
          <div className="space-y-4">
            {vehicles.length === 0 ? (
              <p className="text-sm text-slate-600">No saved vehicles.</p>
            ) : (
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="text-sm text-slate-700">
                    <p className="font-medium text-slate-950">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p>
                      {vehicle.color} • {vehicle.plate} • {vehicle.state}
                    </p>
                    {vehicle.isDefault ? (
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Default Vehicle
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/vehicles?edit=${vehicle.id}`}
                      className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
                    >
                      Edit
                    </Link>
                    <form action={setDefaultVehicleAction}>
                      <input type="hidden" name="vehicleId" value={vehicle.id} />
                      <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700">
                        Set Default Vehicle
                      </button>
                    </form>
                    <form action={deleteVehicleAction}>
                      <input type="hidden" name="vehicleId" value={vehicle.id} />
                      <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}>
            <form
              action={editingVehicle ? updateVehicleAction : addVehicleAction}
              className="grid gap-4 md:grid-cols-2"
            >
              {editingVehicle ? (
                <input type="hidden" name="vehicleId" value={editingVehicle.id} />
              ) : null}
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Make</span>
                <input
                  name="make"
                  defaultValue={editingVehicle?.make ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Model</span>
                <input
                  name="model"
                  defaultValue={editingVehicle?.model ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Year</span>
                <input
                  name="year"
                  type="number"
                  defaultValue={editingVehicle?.year ?? 2024}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Color</span>
                <input
                  name="color"
                  defaultValue={editingVehicle?.color ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Plate</span>
                <input
                  name="plate"
                  defaultValue={editingVehicle?.plate ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">State</span>
                <input
                  name="state"
                  defaultValue={editingVehicle?.state ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="flex items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  defaultChecked={editingVehicle?.isDefault ?? false}
                />
                <span className="text-sm text-slate-700">Set as default</span>
              </label>
              <div className="md:col-span-2">
                <button className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                  {editingVehicle ? "Save Vehicle" : "Add Vehicle"}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Request Visit Ready">
            <div className="space-y-3 text-sm text-slate-600">
              <p>The default vehicle is used for new visit requests.</p>
              <Link
                href="/request-visit"
                className="inline-flex rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white"
              >
                Request Visit
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </PortalShell>
  );
}
