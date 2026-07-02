import Link from "next/link";
import { getGuests } from "@/lib/admin-data";
import { SectionCard } from "@/components/section-card";

export const dynamic = "force-dynamic";

type GuestsPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function GuestsPage({ searchParams }: GuestsPageProps) {
  const { q: query = "" } = (await searchParams) ?? {};
  const guests = await getGuests(query);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Guests
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Searchable guest directory
          </h1>
        </div>
        <form className="w-full max-w-sm">
          <label className="sr-only" htmlFor="guest-search">
            Search guests
          </label>
          <input
            id="guest-search"
            name="q"
            defaultValue={query}
            placeholder="Search name, phone, email, plate"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-950"
          />
        </form>
      </div>

      <SectionCard title="Guest Table">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Vehicles</th>
                <th className="px-4 py-3">Visits</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-sm text-slate-500">
                    No guests found.
                  </td>
                </tr>
              ) : (
                guests.map((guest) => (
                  <tr key={guest.id} className="text-sm text-slate-700">
                    <td className="px-4 py-4 font-medium text-slate-950">
                      {guest.firstName} {guest.lastName}
                    </td>
                    <td className="px-4 py-4">{guest.phone}</td>
                    <td className="px-4 py-4">{guest.email}</td>
                    <td className="px-4 py-4">{guest.vehicles.length}</td>
                    <td className="px-4 py-4">{guest.visits.length}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700">
                          View
                        </button>
                        <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700">
                          Edit
                        </button>
                        <button className="rounded-md border border-slate-950 bg-slate-950 px-3 py-2 text-xs font-medium text-white">
                          New Visit
                        </button>
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
        <Link
          href="/quick-register"
          className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white"
        >
          Quick Register
        </Link>
      </div>
    </div>
  );
}
