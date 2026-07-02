import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { requireCurrentGuest } from "@/lib/portal";
import { updateProfileAction } from "@/lib/portal-actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const guest = await requireCurrentGuest();

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Profile
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Guest profile
          </h1>
        </div>

        <SectionCard title="Editable Details">
          <form action={updateProfileAction} className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                First Name
              </span>
              <input
                name="firstName"
                defaultValue={guest.firstName}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Last Name
              </span>
              <input
                name="lastName"
                defaultValue={guest.lastName}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                name="email"
                defaultValue={guest.email}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Phone</span>
              <input
                name="phone"
                defaultValue={guest.phone}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
              />
            </label>

            <div className="md:col-span-2">
              <button className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                Save Profile
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </PortalShell>
  );
}
