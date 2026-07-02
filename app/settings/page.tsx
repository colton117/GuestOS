import { SectionCard } from "@/components/section-card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          System settings
        </h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Property">
          <div className="space-y-3 text-sm text-slate-600">
            <p>GuestOS foundation configured for resident operations.</p>
            <p>Database-backed guest, vehicle, and visit records are enabled.</p>
          </div>
        </SectionCard>

        <SectionCard title="Access">
          <div className="space-y-3 text-sm text-slate-600">
            <p>Default visitor permissions are enabled for new visits.</p>
            <p>Approval states are managed in the Requests queue.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
