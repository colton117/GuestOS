import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarRange, DoorOpen, MapPinned, Sparkles } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { Modal } from "@/components/ui/modal";
import { RequestVisitForm } from "@/components/request-visit-form";
import {
  getGuestVehicles,
  getGuestVisitState,
  requireCurrentGuest,
} from "@/lib/portal";
import { requestVisitAction } from "@/lib/portal-actions";
import { addOneDay, roundDownToNearestHalfHour, toDateTimeLocalValue } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export default async function RequestVisitPage({
  searchParams,
}: {
  searchParams?: Promise<{ new?: string }>;
}) {
  const guest = await requireCurrentGuest();
  const visitState = await getGuestVisitState(guest.id);

  if (visitState.kind !== "no_visit") {
    redirect("/current-visit");
  }

  const { new: showForm } = (await searchParams) ?? {};
  const vehicles = await getGuestVehicles(guest.id);
  const defaultVehicle =
    vehicles.find((vehicle) => vehicle.isDefault) ?? vehicles[0];
  const roundedArrival = roundDownToNearestHalfHour(new Date());
  const defaultArrival = toDateTimeLocalValue(roundedArrival);
  const defaultDeparture = toDateTimeLocalValue(addOneDay(roundedArrival));

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <div className="space-y-6 lg:space-y-8">
        <section className="gos-card overflow-hidden gos-fade-in">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <div className="space-y-4">
                <p className="gos-badge">GuestOS Booking</p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-6xl">
                  Request a new visit
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[color:var(--gos-muted)] sm:text-lg">
                  Let your host know when you&apos;re arriving.
                </p>
              </div>

              <div className="mt-6">
                {vehicles.length === 0 ? (
                  <EmptyVehiclePrompt />
                ) : (
                  <Link href="/request-visit?new=1" className="gos-button-primary w-fit">
                    <CalendarRange className="h-4 w-4" />
                    Request New Visit
                  </Link>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Feature icon={CalendarRange} title="Any time works" text="Pick the date and time that's best for you." />
                <Feature icon={MapPinned} title="Everything in one place" text="Access and arrival info, together." />
                <Feature icon={Sparkles} title="We'll notify your host" text="Your host gets notified as soon as you submit." />
              </div>
            </div>

            <div className="border-t border-[rgba(31,46,39,0.08)] bg-[rgba(255,255,255,0.7)] px-6 py-8 sm:px-8 lg:border-l lg:border-t-0">
              <div className="gos-panel p-5">
                <p className="text-sm font-semibold text-[color:var(--gos-primary)]">
                  What to know
                </p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--gos-muted)]">
                  <p>Arrival and departure windows stay easy to review.</p>
                  <p>Vehicle, parking, and access preferences remain optional and explicit.</p>
                  <p>You can change these details later if plans shift.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {vehicles.length > 0 ? (
        <Modal
          open={Boolean(showForm)}
          closeHref="/request-visit"
          title="Request a New Visit"
        >
          <RequestVisitForm
            action={requestVisitAction}
            vehicles={vehicles}
            defaultVehicleId={defaultVehicle?.id ?? ""}
            defaultArrival={defaultArrival}
            defaultDeparture={defaultDeparture}
          />
        </Modal>
      ) : null}
    </PortalShell>
  );
}

function EmptyVehiclePrompt() {
  return (
    <div className="gos-panel flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-[rgba(31,46,39,0.06)]">
          <DoorOpen className="h-6 w-6 text-[color:var(--gos-primary)]" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-[color:var(--gos-primary)]">
            Add a vehicle first
          </p>
          <p className="max-w-2xl text-sm leading-6 text-[color:var(--gos-muted)]">
            We need a vehicle on file before you can request a visit. Add one, then come back to finish booking.
          </p>
        </div>
      </div>
      <Link href="/vehicles" className="gos-button-primary w-full sm:w-auto">
        <DoorOpen className="h-4 w-4" />
        Add Vehicle
      </Link>
    </div>
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
