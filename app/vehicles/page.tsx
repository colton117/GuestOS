import Link from "next/link";
import { CarFront, CheckCircle2, PlusCircle, PencilLine, Trash2 } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { Modal } from "@/components/ui/modal";
import { VehicleFormFields } from "@/components/vehicle-form-fields";
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
        <section className="gos-card overflow-hidden gos-fade-in">
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="gos-badge">Vehicles</p>
              <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-5xl">
                Your vehicles
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[color:var(--gos-muted)]">
                Mark your main vehicle so it&apos;s ready to go when you request a visit.
              </p>
            </div>
            <Link href="/request-visit?new=1" className="gos-button-primary">
              <PlusCircle className="h-4 w-4" />
              Request Visit
            </Link>
          </div>
        </section>

        <SectionCard title="Vehicle List">
          <div className="space-y-4">
            {vehicles.length === 0 ? (
              <EmptyVehiclesState />
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
                    {vehicle.isDefault ? null : (
                      <form action={setDefaultVehicleAction}>
                        <input type="hidden" name="vehicleId" value={vehicle.id} />
                        <SubmitButton
                          pendingLabel="Setting…"
                          className="gos-button-secondary text-xs"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Set Default
                        </SubmitButton>
                      </form>
                    )}
                    <form action={deleteVehicleAction}>
                      <input type="hidden" name="vehicleId" value={vehicle.id} />
                      <SubmitButton
                        pendingLabel="Deleting…"
                        className="gos-button-secondary text-xs"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </SubmitButton>
                    </form>
                  </div>
                </article>
              ))
            )}
          </div>
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <SectionCard title="Add Vehicle">
            <form action={addVehicleAction} className="grid gap-4 md:grid-cols-2">
              <VehicleFormFields />
              <div className="md:col-span-2 flex justify-end">
                <SubmitButton
                  pendingLabel="Saving…"
                  className="gos-button-primary w-full sm:w-auto"
                >
                  Add Vehicle
                </SubmitButton>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Ready for your next visit">
            <div className="gos-panel p-5">
              <p className="text-sm leading-6 text-[color:var(--gos-muted)]">
                We&apos;ll use your primary vehicle when you request a new visit.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>

      <Modal open={Boolean(editingVehicle)} closeHref="/vehicles" title="Edit Vehicle">
        {editingVehicle ? (
          <form action={updateVehicleAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="vehicleId" value={editingVehicle.id} />
            <VehicleFormFields defaultValues={editingVehicle} />
            <div className="md:col-span-2 flex justify-end">
              <SubmitButton
                pendingLabel="Saving…"
                className="gos-button-primary w-full sm:w-auto"
              >
                Save Vehicle
              </SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>
    </PortalShell>
  );
}

function EmptyVehiclesState() {
  return (
    <div className="gos-panel flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-[rgba(31,46,39,0.06)]">
          <CarFront className="h-6 w-6 text-[color:var(--gos-primary)]" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-[color:var(--gos-primary)]">
            No vehicles saved yet
          </p>
          <p className="max-w-2xl text-sm leading-6 text-[color:var(--gos-muted)]">
            Add your primary vehicle so future visits can be requested without extra setup.
          </p>
        </div>
      </div>
    </div>
  );
}
