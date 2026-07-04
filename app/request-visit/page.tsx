import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarRange, DoorOpen, MapPinned, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { SmsConsentCheckbox } from "@/components/sms-consent-checkbox";
import {
  getGuestVehicles,
  getGuestVisitState,
  requireCurrentGuest,
} from "@/lib/portal";
import { requestVisitAction } from "@/lib/portal-actions";

export const dynamic = "force-dynamic";

export default async function RequestVisitPage() {
  const guest = await requireCurrentGuest();
  const visitState = await getGuestVisitState(guest.id);

  if (visitState.kind !== "no_visit") {
    redirect("/current-visit");
  }

  const vehicles = await getGuestVehicles(guest.id);
  const defaultVehicle =
    vehicles.find((vehicle) => vehicle.isDefault) ?? vehicles[0];

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <div className="space-y-6 lg:space-y-8">
        <section className="gos-card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <div className="space-y-4">
                <p className="gos-badge">GuestOS Booking</p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-6xl">
                  Request a new visit
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[color:var(--gos-muted)] sm:text-lg">
                  A calm, hotel-style booking flow for future stays and guest arrivals.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Feature icon={CalendarRange} title="Flexible arrival" text="Choose the date and time that works best." />
                <Feature icon={MapPinned} title="Property aware" text="Keep access and arrival details in one place." />
                <Feature icon={Sparkles} title="Concierge support" text="Your request is handled in a premium workflow." />
              </div>
            </div>

            <div className="border-t border-[rgba(31,46,39,0.08)] bg-[rgba(255,255,255,0.7)] px-6 py-8 sm:px-8 lg:border-l lg:border-t-0">
              <div className="gos-panel p-5">
                <p className="text-sm font-semibold text-[color:var(--gos-primary)]">
                  Booking essentials
                </p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--gos-muted)]">
                  <p>Arrival and departure windows stay easy to review.</p>
                  <p>Vehicle, parking, and access preferences remain optional and explicit.</p>
                  <p>GuestOS keeps the experience calm and predictable.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionCard title="Visit Request">
          {vehicles.length === 0 ? (
            <div className="space-y-4">
              <div className="gos-panel p-6">
                <p className="text-sm leading-6 text-[color:var(--gos-muted)]">
                  Add a vehicle before requesting a visit.
                </p>
              </div>
              <Link href="/vehicles" className="gos-button-primary">
                <DoorOpen className="h-4 w-4" />
                Add Vehicle
              </Link>
            </div>
          ) : (
            <form action={requestVisitAction} className="grid gap-5 md:grid-cols-2">
              <Field label="Arrival Date & Time">
                <input name="arrivalDateTime" type="datetime-local" className="gos-input" />
              </Field>
              <Field label="Departure Date & Time">
                <input name="departureDateTime" type="datetime-local" className="gos-input" />
              </Field>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                  Vehicle
                </span>
                <select
                  name="vehicleId"
                  defaultValue={defaultVehicle?.id ?? ""}
                  className="gos-input"
                >
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.isDefault ? "Primary - " : ""}
                      {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.plate}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
                <ToggleCard name="parkingRequired" label="Parking Required" />
                <ToggleCard name="buildingAccessRequired" label="Building Access Required" />
                <ToggleCard name="apartmentAccessRequired" label="Apartment Access Required" />
              </div>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                  Request Notes
                </span>
                <textarea
                  name="requestNotes"
                  rows={5}
                  className="gos-input"
                />
              </label>

              <div className="md:col-span-2">
                <SmsConsentCheckbox />
              </div>

              <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link href="/vehicles" className="gos-button-secondary">
                  Manage Vehicles
                </Link>
                <button className="gos-button-primary">
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

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-[color:var(--gos-primary)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function ToggleCard({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-[24px] bg-[rgba(31,46,39,0.04)] px-4 py-4">
      <input
        type="checkbox"
        name={name}
        defaultChecked
        className="h-4 w-4 rounded border-[rgba(31,46,39,0.25)] text-[color:var(--gos-primary)]"
      />
      <span className="text-sm text-[color:var(--gos-text)]">{label}</span>
    </label>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof CalendarRange;
  title: string;
  text: string;
}) {
  return (
    <div className="gos-panel p-4">
      <Icon className="h-5 w-5 text-[color:var(--gos-accent)]" />
      <p className="mt-3 text-sm font-semibold text-[color:var(--gos-primary)]">
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-[color:var(--gos-muted)]">{text}</p>
    </div>
  );
}
