import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { findQuickRegisterMatch } from "@/lib/admin-data";
import { SectionCard } from "@/components/section-card";
import { AutoSearchInput } from "@/components/auto-search-input";
import { Modal } from "@/components/ui/modal";
import { VehicleFormFields } from "@/components/vehicle-form-fields";
import { requireAdminSession } from "@/lib/admin-auth";
import { adminUpdateGuestAction, adminUpdateVehicleAction } from "@/lib/admin-guest-actions";
import {
  adminCreateGuestAction,
  adminCreateVisitAction,
} from "@/lib/admin-visit-actions";
import { addOneDay, roundDownToNearestHalfHour, toDateTimeLocalValue } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

type QuickRegisterPageProps = {
  searchParams?: Promise<{
    q?: string;
    error?: string;
    editGuest?: string;
    editVehicle?: string;
  }>;
};

export default async function QuickRegisterPage({
  searchParams,
}: QuickRegisterPageProps) {
  await requireAdminSession("/quick-register");

  const { q: query = "", error, editGuest, editVehicle } = (await searchParams) ?? {};
  const guest = await findQuickRegisterMatch(query);
  const defaultVehicle =
    guest?.vehicles.find((vehicle) => vehicle.isDefault) ?? guest?.vehicles[0];
  const roundedArrival = roundDownToNearestHalfHour(new Date());
  const defaultArrival = toDateTimeLocalValue(roundedArrival);
  const defaultDeparture = toDateTimeLocalValue(addOneDay(roundedArrival));
  const closeHref = `/quick-register?q=${encodeURIComponent(query)}`;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <p className="gos-section-title text-[0.72rem] font-semibold">
            Quick Register
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
            Search and register a visit
          </h1>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <SectionCard title="Lookup">
          <form className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--gos-primary)]">
                Search by name, email, phone, or license plate
              </label>
              <AutoSearchInput
                name="q"
                defaultValue={query}
                placeholder="Type a guest or vehicle identifier"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="gos-button-primary w-full text-sm md:w-auto">
                Search
              </button>
            </div>
          </form>
        </SectionCard>

        {guest ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Matched Guest">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-[color:var(--gos-muted)]">Guest</p>
                  <p className="font-medium text-[color:var(--gos-primary)]">
                    {guest.firstName} {guest.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-[color:var(--gos-muted)]">Email</p>
                  <p className="font-medium text-[color:var(--gos-primary)]">
                    {guest.email}
                  </p>
                </div>
                <div>
                  <p className="text-[color:var(--gos-muted)]">Phone</p>
                  <p className="font-medium text-[color:var(--gos-primary)]">
                    {guest.phone || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[color:var(--gos-muted)]">Default Vehicle</p>
                  <p className="font-medium text-[color:var(--gos-primary)]">
                    {defaultVehicle
                      ? `${defaultVehicle.year} ${defaultVehicle.make} ${defaultVehicle.model} ${defaultVehicle.plate}`
                      : "No vehicle on file"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/quick-register?q=${encodeURIComponent(query)}&editGuest=1`}
                    className="gos-button-secondary text-xs"
                  >
                    Edit Guest Details
                  </Link>
                  {defaultVehicle ? (
                    <Link
                      href={`/quick-register?q=${encodeURIComponent(query)}&editVehicle=1`}
                      className="gos-button-secondary text-xs"
                    >
                      Edit Vehicle
                    </Link>
                  ) : null}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Visit Details">
              <form
                action={adminCreateVisitAction}
                className="space-y-4 text-sm text-[color:var(--gos-text)]"
              >
                <input type="hidden" name="guestId" value={guest.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="gos-label space-y-2">
                    <span className="block font-medium text-[color:var(--gos-primary)]">
                      Arrival Date &amp; Time
                    </span>
                    <input
                      name="arrivalDateTime"
                      type="datetime-local"
                      defaultValue={defaultArrival}
                      required
                      className="gos-input text-sm"
                    />
                  </label>
                  <label className="gos-label space-y-2">
                    <span className="block font-medium text-[color:var(--gos-primary)]">
                      Departure Date &amp; Time
                    </span>
                    <input
                      name="departureDateTime"
                      type="datetime-local"
                      defaultValue={defaultDeparture}
                      className="gos-input text-sm"
                    />
                  </label>
                </div>

                {guest.vehicles.length > 0 ? (
                  <label className="gos-label space-y-2">
                    <span className="block font-medium text-[color:var(--gos-primary)]">
                      Vehicle
                    </span>
                    <select
                      name="vehicleId"
                      defaultValue={defaultVehicle?.id ?? ""}
                      className="gos-input text-sm"
                    >
                      <option value="">No vehicle</option>
                      {guest.vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model}{" "}
                          {vehicle.plate}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="flex items-center gap-3 rounded-lg border border-[rgba(31,46,39,0.12)] px-4 py-3">
                    <input type="checkbox" name="parkingRequired" defaultChecked />
                    <span>Parking</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-[rgba(31,46,39,0.12)] px-4 py-3">
                    <input
                      type="checkbox"
                      name="buildingAccessRequired"
                      defaultChecked
                    />
                    <span>Building Access</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-[rgba(31,46,39,0.12)] px-4 py-3">
                    <input
                      type="checkbox"
                      name="apartmentAccessRequired"
                      defaultChecked
                    />
                    <span>Apartment Access</span>
                  </label>
                </div>

                <button type="submit" className="gos-button-primary w-full text-sm">
                  Register Visit
                </button>
              </form>
            </SectionCard>
          </div>
        ) : query ? (
          <SectionCard title="No Match">
            <div className="space-y-6">
              <p className="text-sm text-[color:var(--gos-muted)]">
                No guest matched &ldquo;{query}&rdquo;. Create a new guest
                below to register their visit.
              </p>
              <form
                action={adminCreateGuestAction}
                className="grid gap-4 sm:grid-cols-2"
              >
                <label className="gos-label space-y-2">
                  <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                    First Name
                  </span>
                  <input name="firstName" required className="gos-input text-sm" />
                </label>
                <label className="gos-label space-y-2">
                  <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                    Last Name
                  </span>
                  <input name="lastName" required className="gos-input text-sm" />
                </label>
                <label className="gos-label space-y-2">
                  <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="gos-input text-sm"
                  />
                </label>
                <label className="gos-label space-y-2">
                  <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                    Phone
                  </span>
                  <input name="phone" type="tel" required className="gos-input text-sm" />
                </label>
                <div className="sm:col-span-2">
                  <button type="submit" className="gos-button-primary w-full text-sm sm:w-auto">
                    Create Guest
                  </button>
                </div>
              </form>
              <div className="border-t border-[rgba(31,46,39,0.08)] pt-4 text-right">
                <Link
                  href="/guests"
                  className="text-sm text-[color:var(--gos-muted)] underline underline-offset-4"
                >
                  Or browse the guest directory
                </Link>
              </div>
            </div>
          </SectionCard>
        ) : null}
      </div>

      {guest ? (
        <Modal
          open={Boolean(editGuest)}
          closeHref={closeHref}
          title="Edit Guest Details"
        >
          <form action={adminUpdateGuestAction} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="guestId" value={guest.id} />
            <input type="hidden" name="successRedirect" value={closeHref} />
            <input
              type="hidden"
              name="errorRedirect"
              value={`${closeHref}&editGuest=1&error=${encodeURIComponent(
                "Please check the name, email, and phone number and try again.",
              )}`}
            />
            <label className="gos-label space-y-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                First Name
              </span>
              <input
                name="firstName"
                defaultValue={guest.firstName}
                required
                className="gos-input text-sm"
              />
            </label>
            <label className="gos-label space-y-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Last Name
              </span>
              <input
                name="lastName"
                defaultValue={guest.lastName}
                required
                className="gos-input text-sm"
              />
            </label>
            <label className="gos-label space-y-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Email
              </span>
              <input
                name="email"
                type="email"
                defaultValue={guest.email}
                required
                className="gos-input text-sm"
              />
            </label>
            <label className="gos-label space-y-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Phone
              </span>
              <input
                name="phone"
                type="tel"
                defaultValue={guest.phone}
                required
                className="gos-input text-sm"
              />
            </label>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" className="gos-button-primary text-sm">
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {guest && defaultVehicle ? (
        <Modal
          open={Boolean(editVehicle)}
          closeHref={closeHref}
          title="Edit Vehicle"
        >
          <form action={adminUpdateVehicleAction} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="guestId" value={guest.id} />
            <input type="hidden" name="vehicleId" value={defaultVehicle.id} />
            <input type="hidden" name="successRedirect" value={closeHref} />
            <VehicleFormFields defaultValues={defaultVehicle} />
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" className="gos-button-primary text-sm">
                Save Vehicle
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </AdminShell>
  );
}
