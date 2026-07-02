import Link from "next/link";
import { findQuickRegisterMatch } from "@/lib/admin-data";
import { SectionCard } from "@/components/section-card";

export const dynamic = "force-dynamic";

type QuickRegisterPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function QuickRegisterPage({
  searchParams,
}: QuickRegisterPageProps) {
  const { q: query = "" } = (await searchParams) ?? {};
  const guest = await findQuickRegisterMatch(query);
  const defaultVehicle =
    guest?.vehicles.find((vehicle) => vehicle.isDefault) ?? guest?.vehicles[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Quick Register
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Search and register a visit
        </h1>
      </div>

      <SectionCard title="Lookup">
        <form className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search by name, email, phone, or license plate
            </label>
            <input
              name="q"
              defaultValue={query}
              placeholder="Type a guest or vehicle identifier"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-950"
            />
          </div>
          <div className="flex items-end">
            <button className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
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
                <p className="text-slate-500">Guest</p>
                <p className="font-medium text-slate-950">
                  {guest.firstName} {guest.lastName}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-medium text-slate-950">{guest.email}</p>
              </div>
              <div>
                <p className="text-slate-500">Phone</p>
                <p className="font-medium text-slate-950">{guest.phone}</p>
              </div>
              <div>
                <p className="text-slate-500">Default Vehicle</p>
                <p className="font-medium text-slate-950">
                  {defaultVehicle
                    ? `${defaultVehicle.year} ${defaultVehicle.make} ${defaultVehicle.model} ${defaultVehicle.plate}`
                    : "No vehicle on file"}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Visit Details">
            <div className="space-y-4 text-sm text-slate-700">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="block font-medium text-slate-700">
                    Arrival Date & Time
                  </span>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                  />
                </label>
                <label className="space-y-2">
                  <span className="block font-medium text-slate-700">
                    Departure Date & Time
                  </span>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                  <input type="checkbox" defaultChecked />
                  <span>Parking</span>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                  <input type="checkbox" defaultChecked />
                  <span>Building Access</span>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                  <input type="checkbox" defaultChecked />
                  <span>Apartment Access</span>
                </label>
              </div>

              <button className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                Register Visit
              </button>
            </div>
          </SectionCard>
        </div>
      ) : (
        <SectionCard title="No Match">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              No guest matched the current search.
            </p>
            <Link
              href="/guests"
              className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white"
            >
              Create New Guest
            </Link>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
