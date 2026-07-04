import Link from "next/link";
import { CarFront, CheckCircle2, PlusCircle, PencilLine, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
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
      <div className="space-y-6 lg:space-y-8">
        <section className="gos-card overflow-hidden">
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="gos-badge">Vehicles</p>
              <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-5xl">
                Premium vehicle list
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[color:var(--gos-muted)]">
                Keep your arrivals simple with clearly marked primary and secondary vehicles.
              </p>
            </div>
            <Link href="/request-visit" className="gos-button-primary">
              <PlusCircle className="h-4 w-4" />
              Request Visit
            </Link>
          </div>
        </section>

        <SectionCard title="Vehicle List">
          <div className="space-y-4">
            {vehicles.length === 0 ? (
              <div className="gos-panel p-6 text-sm text-[color:var(--gos-muted)]">
                No saved vehicles.
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <article
                  key={vehicle.id}
                  className="gos-panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-[rgba(31,46,39,0.06)]">
                      <CarFront className="h-6 w-6 text-[color:var(--gos-primary)]" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-[color:var(--gos-primary)]">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--gos-muted)]">
                        {vehicle.color} • {vehicle.plate} • {vehicle.state}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {vehicle.isDefault ? (
                          <span className="gos-badge bg-[rgba(62,107,78,0.12)] text-[color:var(--gos-success)]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Primary vehicle
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/vehicles?edit=${vehicle.id}`}
                      className="gos-button-secondary text-xs"
                    >
                      <PencilLine className="h-4 w-4" />
                      Edit
                    </Link>
                    <form action={setDefaultVehicleAction}>
                      <input type="hidden" name="vehicleId" value={vehicle.id} />
                      <button className="gos-button-secondary text-xs">
                        <CheckCircle2 className="h-4 w-4" />
                        Set Default
                      </button>
                    </form>
                    <form action={deleteVehicleAction}>
                      <input type="hidden" name="vehicleId" value={vehicle.id} />
                      <button className="gos-button-secondary text-xs">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              ))
            )}
          </div>
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <SectionCard title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}>
            <form
              action={editingVehicle ? updateVehicleAction : addVehicleAction}
              className="grid gap-4 md:grid-cols-2"
            >
              {editingVehicle ? (
                <input type="hidden" name="vehicleId" value={editingVehicle.id} />
              ) : null}
              <Field label="Make">
                <input name="make" defaultValue={editingVehicle?.make ?? ""} className="gos-input" />
              </Field>
              <Field label="Model">
                <input name="model" defaultValue={editingVehicle?.model ?? ""} className="gos-input" />
              </Field>
              <Field label="Year">
                <input
                  name="year"
                  type="number"
                  defaultValue={editingVehicle?.year ?? 2024}
                  className="gos-input"
                />
              </Field>
              <Field label="Color">
                <input name="color" defaultValue={editingVehicle?.color ?? ""} className="gos-input" />
              </Field>
              <Field label="Plate">
                <input name="plate" defaultValue={editingVehicle?.plate ?? ""} className="gos-input" />
              </Field>
              <Field label="State">
                <input name="state" defaultValue={editingVehicle?.state ?? ""} className="gos-input" />
              </Field>
              <label className="md:col-span-2 flex items-center gap-3 rounded-[24px] bg-[rgba(31,46,39,0.04)] px-4 py-4">
                <input
                  type="checkbox"
                  name="isDefault"
                  defaultChecked={editingVehicle?.isDefault ?? false}
                  className="h-4 w-4 rounded border-[rgba(31,46,39,0.25)] text-[color:var(--gos-primary)]"
                />
                <span className="text-sm text-[color:var(--gos-text)]">
                  Set as primary vehicle
                </span>
              </label>
              <div className="md:col-span-2 flex justify-end">
                <button className="gos-button-primary w-full sm:w-auto">
                  {editingVehicle ? "Save Vehicle" : "Add Vehicle"}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Visit Ready">
            <div className="space-y-4">
              <div className="gos-panel p-5">
                <p className="text-sm leading-6 text-[color:var(--gos-muted)]">
                  The primary vehicle is used when new visit requests are created.
                </p>
              </div>
              <Link href="/request-visit" className="gos-button-primary w-full">
                Request Visit
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </PortalShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-[color:var(--gos-primary)]">{label}</span>
      {children}
    </label>
  );
}
