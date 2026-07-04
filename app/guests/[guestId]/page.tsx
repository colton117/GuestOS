import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { SectionCard } from "@/components/section-card";
import { getGuestById } from "@/lib/admin-data";
import { adminUpdateGuestAction } from "@/lib/admin-guest-actions";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type GuestDetailPageProps = {
  params: Promise<{ guestId: string }>;
  searchParams?: Promise<{ edit?: string; error?: string }>;
};

export default async function GuestDetailPage({
  params,
  searchParams,
}: GuestDetailPageProps) {
  await requireAdminSession("/guests");

  const { guestId } = await params;
  const { edit, error } = (await searchParams) ?? {};
  const guest = await getGuestById(guestId);

  if (!guest) {
    notFound();
  }

  const isEditing = edit === "1";

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="gos-section-title text-[0.72rem] font-semibold">
              Guests
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
              {guest.firstName} {guest.lastName}
            </h1>
          </div>
          <div className="flex gap-2">
            <Link
              href={
                isEditing ? `/guests/${guest.id}` : `/guests/${guest.id}?edit=1`
              }
              className="gos-button-secondary text-sm"
            >
              {isEditing ? "Cancel" : "Edit"}
            </Link>
            <Link
              href={`/quick-register?q=${encodeURIComponent(guest.email)}`}
              className="gos-button-primary text-sm"
            >
              New Visit
            </Link>
          </div>
        </div>

        {isEditing ? (
          <SectionCard title="Edit Guest">
            <div className="space-y-4">
              {error === "invalid" ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Please check the name, email, and phone number and try again.
                </div>
              ) : null}
              <form
                action={adminUpdateGuestAction}
                className="grid gap-4 sm:grid-cols-2"
              >
                <input type="hidden" name="guestId" value={guest.id} />
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
                <div className="sm:col-span-2">
                  <button type="submit" className="gos-button-primary text-sm">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="Guest Details">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[color:var(--gos-muted)]">Email</dt>
                <dd className="mt-1 font-medium text-[color:var(--gos-primary)]">
                  {guest.email}
                </dd>
              </div>
              <div>
                <dt className="text-[color:var(--gos-muted)]">Phone</dt>
                <dd className="mt-1 font-medium text-[color:var(--gos-primary)]">
                  {guest.phone || "—"}
                </dd>
              </div>
            </dl>
          </SectionCard>
        )}

        <SectionCard title="Vehicles">
          {guest.vehicles.length === 0 ? (
            <p className="text-sm text-[color:var(--gos-muted)]">
              No vehicles on file.
            </p>
          ) : (
            <ul className="space-y-3">
              {guest.vehicles.map((vehicle) => (
                <li
                  key={vehicle.id}
                  className="gos-panel flex items-center justify-between p-4 text-sm"
                >
                  <span>
                    {vehicle.year} {vehicle.make} {vehicle.model} &middot;{" "}
                    {vehicle.plate} ({vehicle.state})
                  </span>
                  {vehicle.isDefault ? (
                    <span className="gos-badge">Default</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Visit History">
          {guest.visits.length === 0 ? (
            <p className="text-sm text-[color:var(--gos-muted)]">
              No visits yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {guest.visits.map((visit) => (
                <li
                  key={visit.id}
                  className="gos-panel flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
                >
                  <span>{visit.arrivalDateTime.toLocaleString()}</span>
                  <span className="gos-badge">{visit.status}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </AdminShell>
  );
}
