import Image from "next/image";
import { redirect } from "next/navigation";
import {
  CarFront,
  Home,
  MapPinned,
  Sparkles,
  Wifi,
  BedDouble,
  ShieldCheck,
  FileText,
  UserRound,
} from "lucide-react";
import { CurrentVisitCountdown } from "@/components/current-visit-countdown";
import { CurrentVisitAccessActions } from "@/components/current-visit-access-actions";
import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { cancelVisitRequestAction } from "@/lib/portal-actions";
import { getCurrentGuest, getGuestVisitState } from "@/lib/portal";
import { getGuestBranding } from "@/lib/branding";

export const dynamic = "force-dynamic";

function formatDateTime(value: Date | null | undefined) {
  return value ? value.toLocaleString() : "—";
}

function renderVehicleLabel(
  vehicle:
    | {
        year: number;
        make: string;
        model: string;
        plate: string;
      }
    | null
    | undefined,
) {
  if (!vehicle) {
    return null;
  }

  return `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.plate}`;
}

function getStatusTone(kind: string) {
  switch (kind) {
    case "active_visit":
      return "bg-[rgba(62,107,78,0.12)] text-[color:var(--gos-success)]";
    case "upcoming_approved_visit":
      return "bg-[rgba(168,138,90,0.14)] text-[color:var(--gos-accent)]";
    case "pending_visit_request":
      return "bg-[rgba(184,138,46,0.14)] text-[color:var(--gos-warning)]";
    default:
      return "bg-[rgba(31,46,39,0.08)] text-[color:var(--gos-primary)]";
  }
}

function getStatusLabel(kind: string) {
  switch (kind) {
    case "active_visit":
      return "Active Visit";
    case "upcoming_approved_visit":
      return "Approved Visit";
    case "pending_visit_request":
      return "Pending Approval";
    default:
      return "Guest Stay";
  }
}

export default async function CurrentVisitPage() {
  const guest = await getCurrentGuest();

  if (!guest) {
    redirect("/login");
  }

  const branding = await getGuestBranding();
  const state = await getGuestVisitState(guest.id);

  if (state.kind === "no_visit") {
    redirect("/request-visit");
  }

  const visit = state.visit;
  const propertyName = branding.welcomeMessage ?? "4123 Cedar Springs";
  const guestName = `${guest.firstName} ${guest.lastName}`;

  return (
    <PortalShell guestName={guestName}>
      <div className="space-y-6 lg:space-y-8">
        <section className="gos-card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative overflow-hidden px-6 py-7 sm:px-8 sm:py-10">
              <div className="absolute inset-0 bg-[rgba(31,46,39,0.03)]" />
              <div className="absolute left-8 top-8 h-36 w-36 rounded-full bg-[rgba(168,138,90,0.16)] blur-3xl" />
              <div className="relative space-y-7">
                <div className="space-y-4">
                  <p className="gos-badge gos-scale-in">GuestOS Concierge</p>
                  <div className="space-y-3">
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-[color:var(--gos-muted)]">
                      Welcome back, {guest.firstName}
                    </p>
                    <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-6xl">
                      {propertyName}
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-[color:var(--gos-muted)] sm:text-lg">
                      {state.kind === "pending_visit_request"
                        ? "Your request is under review. We will keep everything calm and guided while you wait for approval."
                        : state.kind === "upcoming_approved_visit"
                          ? "Your arrival is confirmed. GuestOS is preparing access details and arrival timing."
                          : "Your stay is ready. Use the concierge actions below for a seamless arrival."}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="gos-panel p-4 gos-slide-in">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                      Status
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[color:var(--gos-primary)]">
                      {getStatusLabel(state.kind)}
                    </p>
                  </div>
                  <div className="gos-panel p-4 gos-slide-in">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                      Arrival
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[color:var(--gos-primary)]">
                      {formatDateTime(visit?.arrivalDateTime)}
                    </p>
                  </div>
                  <div className="gos-panel p-4 gos-slide-in">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                      Departure
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[color:var(--gos-primary)]">
                      {formatDateTime(visit?.departureDateTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[rgba(31,46,39,0.08)] bg-[rgba(255,255,255,0.7)] px-6 py-7 sm:px-8 lg:border-l lg:border-t-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="gos-section-title text-[0.72rem] font-semibold">
                      Current stay
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
                      Concierge summary
                    </h2>
                  </div>
                  <span
                    className={`gos-badge border border-transparent ${getStatusTone(state.kind)}`}
                  >
                    {getStatusLabel(state.kind)}
                  </span>
                </div>

                {branding.logoSrc ? (
                  <div className="flex items-center gap-4 rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-[rgba(31,46,39,0.08)]">
                    <div className="rounded-[24px] border border-[rgba(31,46,39,0.08)] bg-white p-3 shadow-sm">
                      <Image
                        src={branding.logoSrc}
                        alt="Apartment branding"
                        width={72}
                        height={72}
                        className="h-16 w-16 rounded-2xl object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="gos-section-title text-[0.72rem] font-semibold">
                        Property
                      </p>
                      <p className="text-lg font-semibold text-[color:var(--gos-primary)]">
                        {propertyName}
                      </p>
                      <p className="text-sm leading-6 text-[color:var(--gos-muted)]">
                        The apartment brand stays subtle so GuestOS remains primary.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="gos-panel p-5">
                    <p className="gos-section-title text-[0.72rem] font-semibold">
                      Property
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
                      {propertyName}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--gos-muted)]">
                      Property details will appear here once provided by the host.
                    </p>
                  </div>
                )}

                <div className="rounded-[28px] bg-[rgba(31,46,39,0.04)] p-5">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[color:var(--gos-accent)]" />
                    <p className="text-sm font-medium text-[color:var(--gos-primary)]">
                      Concierge summary
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--gos-muted)]">
                    {state.kind === "pending_visit_request"
                      ? "Request submitted. The host has been notified."
                      : state.kind === "upcoming_approved_visit"
                        ? "Arrival is on the calendar and access instructions are ready below."
                        : "All guest services are ready for your stay."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {state.kind === "pending_visit_request" && visit ? (
          <SectionCard title="Pending Approval">
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="gos-panel p-5">
                  <p className="text-base leading-7 text-[color:var(--gos-text)]">
                    Your visit request has been submitted and is awaiting host approval.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <InfoTile icon={Sparkles} label="Submitted" value={formatDateTime(visit.createdAt)} />
                    <InfoTile icon={Home} label="Arrival" value={formatDateTime(visit.arrivalDateTime)} />
                    <InfoTile icon={CarFront} label="Vehicle" value={renderVehicleLabel(visit.vehicle) ?? "No vehicle assigned."} />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="gos-panel p-5">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-[color:var(--gos-success)]" />
                      <p className="text-sm font-semibold text-[color:var(--gos-primary)]">
                        Host notification message
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--gos-muted)]">
                      Your host has been notified and will review the request shortly.
                    </p>
                  </div>

                  <form action={cancelVisitRequestAction} className="gos-panel p-5">
                    <input type="hidden" name="visitId" value={visit.id} />
                    <p className="text-sm font-semibold text-[color:var(--gos-primary)]">
                      Change your mind?
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--gos-muted)]">
                      You can cancel this request and return to booking.
                    </p>
                    <button className="gos-button-secondary mt-4 text-sm">
                      Cancel Request
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {visit && state.kind !== "pending_visit_request" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Current Stay">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`gos-badge ${getStatusTone(state.kind)}`}>
                    {getStatusLabel(state.kind)}
                  </span>
                  {state.kind === "upcoming_approved_visit" ? (
                    <span className="rounded-full bg-[rgba(168,138,90,0.14)] px-3 py-1 text-xs font-semibold text-[color:var(--gos-accent)]">
                      <CurrentVisitCountdown
                        arrivalDateTime={visit.arrivalDateTime.toISOString()}
                      />
                    </span>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoTile icon={Home} label="Welcome" value={propertyName} />
                  <InfoTile
                    icon={FileText}
                    label="Guest Notes"
                    value={visit.requestNotes || "No guest notes yet."}
                  />
                  <InfoTile
                    icon={CarFront}
                    label="Vehicle"
                    value={renderVehicleLabel(visit.vehicle) ?? "No vehicle assigned."}
                  />
                  <InfoTile
                    icon={UserRound}
                    label="Host"
                    value="Host contact details will appear here."
                  />
                </div>
              </div>
            </SectionCard>

            <div className="space-y-4">
              <SectionCard title="Arrival">
                <p className="text-lg font-medium text-[color:var(--gos-primary)]">
                  {formatDateTime(visit.arrivalDateTime)}
                </p>
              </SectionCard>

              {visit.departureDateTime ? (
                <SectionCard title="Departure">
                  <p className="text-lg font-medium text-[color:var(--gos-primary)]">
                    {formatDateTime(visit.departureDateTime)}
                  </p>
                </SectionCard>
              ) : null}

              <SectionCard title="Property">
                <div className="space-y-4">
                  <div className="gos-panel p-5">
                    <p className="text-sm leading-6 text-[color:var(--gos-muted)]">
                      The uploaded apartment branding remains subtle here so GuestOS stays primary.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoTile icon={Wifi} label="Wi-Fi" value="Available on arrival." />
                    <InfoTile
                      icon={BedDouble}
                      label="Amenities"
                      value="Pool, lobby, and shared amenities."
                    />
                  </div>
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Arrival Details">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoTile
                  icon={MapPinned}
                  label="Maps & Directions"
                  value="Concierge directions will be displayed here."
                />
                <InfoTile
                  icon={ShieldCheck}
                  label="Important Information"
                  value="Access instructions and house notes live here."
                />
                <InfoTile icon={Wifi} label="Wi-Fi" value="Network details are added by the host." />
                <InfoTile
                  icon={Sparkles}
                  label="Available Amenities"
                  value="Amenity highlights will be shown here."
                />
              </div>
            </SectionCard>

            <SectionCard title="Access">
              <CurrentVisitAccessActions />
            </SectionCard>
          </div>
        ) : null}
      </div>
    </PortalShell>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home;
  label: string;
  value: string;
}) {
  return (
    <div className="gos-panel p-4 gos-fade-in">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(31,46,39,0.06)]">
          <Icon className="h-5 w-5 text-[color:var(--gos-primary)]" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
            {label}
          </p>
          <p className="mt-1 text-sm leading-6 text-[color:var(--gos-text)]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
