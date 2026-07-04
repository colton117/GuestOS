import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getGuests } from "@/lib/admin-data";
import { SectionCard } from "@/components/section-card";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type GuestsPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function GuestsPage({ searchParams }: GuestsPageProps) {
  await requireAdminSession("/guests");

  const { q: query = "" } = (await searchParams) ?? {};
  const guests = await getGuests(query);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <p className="gos-section-title text-[0.72rem] font-semibold">
              Guests
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-3xl">
              Guests
            </h1>
          </div>
          <form className="w-full sm:max-w-sm">
            <label className="sr-only" htmlFor="guest-search">
              Search guests
            </label>
            <input
              id="guest-search"
              name="q"
              defaultValue={query}
              placeholder="Search name, phone, email, plate"
              className="gos-input text-sm"
            />
          </form>
        </div>

        <SectionCard title="All Guests">
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="min-w-[640px] divide-y divide-[rgba(31,46,39,0.08)] sm:min-w-full">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Vehicles</th>
                  <th className="px-4 py-3">Visits</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(31,46,39,0.08)]">
                {guests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-sm text-[color:var(--gos-muted)]"
                    >
                      No guests found.
                    </td>
                  </tr>
                ) : (
                  guests.map((guest) => (
                    <tr key={guest.id} className="text-sm text-[color:var(--gos-text)]">
                      <td className="px-4 py-4 font-medium text-[color:var(--gos-primary)]">
                        {guest.firstName} {guest.lastName}
                      </td>
                      <td className="px-4 py-4">{guest.phone || "—"}</td>
                      <td className="px-4 py-4">{guest.email}</td>
                      <td className="px-4 py-4">{guest.vehicles.length}</td>
                      <td className="px-4 py-4">{guest.visits.length}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/guests/${guest.id}`}
                            className="gos-button-secondary min-h-[44px] px-3 py-2 text-xs"
                          >
                            View
                          </Link>
                          <Link
                            href={`/guests/${guest.id}?edit=1`}
                            className="gos-button-secondary min-h-[44px] px-3 py-2 text-xs"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/quick-register?q=${encodeURIComponent(guest.email)}`}
                            className="gos-button-primary min-h-[44px] px-3 py-2 text-xs"
                          >
                            New Visit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <Link href="/quick-register" className="gos-button-primary w-full text-sm sm:w-auto">
            Quick Register
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
