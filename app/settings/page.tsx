import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { saveNotificationAction, saveParkingAction } from "@/lib/settings-actions";
import { getSettingsData } from "@/lib/settings-data";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdminSession("/settings");

  const data = await getSettingsData();

  // This is a single-property app today: there's no per-host login identity,
  // just one shared host-tier password. When there's exactly one Host row we
  // treat it as "your" host profile and show it here. Host record CRUD
  // (add/edit/delete) is superadmin-only now (see app/admin/hosts/page.tsx) —
  // Colton, the operator, is the one adding hosts — so this section is a
  // read-only view of your own profile, not an edit form. Zero or multiple
  // hosts is an edge case here — fall back to a simple list/message.
  const singleHost = data.hosts.length === 1 ? data.hosts[0] : null;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <p className="gos-section-title text-[0.72rem] font-semibold">
            Settings
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
            Settings
          </h1>
        </div>

        <SectionCard title="Host Profile">
          {data.hosts.length === 0 ? (
            <p className="text-sm text-[color:var(--gos-muted)]">
              No host profile has been set up yet. Ask your GuestOS operator
              to add one from the Admin Dashboard.
            </p>
          ) : data.hosts.length > 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-[color:var(--gos-muted)]">
                Multiple host records exist. Contact your GuestOS operator to
                manage them from the Admin Dashboard.
              </p>
              <ul className="space-y-3">
                {data.hosts.map((host) => (
                  <li
                    key={host.id}
                    className="gos-panel flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
                  >
                    <span className="font-medium text-[color:var(--gos-primary)]">
                      {host.name}
                    </span>
                    <span>{host.email}</span>
                    <span>{host.phone}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <dl className="grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-[color:var(--gos-muted)]">Name</dt>
                  <dd className="mt-1 font-medium text-[color:var(--gos-primary)]">
                    {singleHost?.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-[color:var(--gos-muted)]">Email</dt>
                  <dd className="mt-1 font-medium text-[color:var(--gos-primary)]">
                    {singleHost?.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-[color:var(--gos-muted)]">Phone</dt>
                  <dd className="mt-1 font-medium text-[color:var(--gos-primary)]">
                    {singleHost?.phone}
                  </dd>
                </div>
              </dl>
              <p className="text-sm text-[color:var(--gos-muted)]">
                To change your name, email, or phone, ask your GuestOS
                operator to update it from the Admin Dashboard.
              </p>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Parking">
          <form action={saveParkingAction} className="space-y-4">
            <label className="gos-label space-y-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Current Quarterly Promo Code
              </span>
              <input
                name="currentQuarterlyPromoCode"
                defaultValue={data.parking?.currentQuarterlyPromoCode ?? ""}
                className="gos-input text-sm"
              />
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="parkingEnabled"
                defaultChecked={data.parking?.parkingEnabled ?? true}
              />
              <span className="text-sm text-[color:var(--gos-text)]">
                Parking Enabled
              </span>
            </label>
            <SubmitButton
              pendingLabel="Saving…"
              className="gos-button-primary w-full text-sm sm:w-auto"
            >
              Save Parking Settings
            </SubmitButton>
          </form>
        </SectionCard>

        <SectionCard title="Notifications">
          <form action={saveNotificationAction} className="space-y-4">
            <label className="gos-label space-y-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Host Email
              </span>
              <input
                name="hostEmail"
                defaultValue={data.notifications?.hostEmail ?? ""}
                className="gos-input text-sm"
              />
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="appleNotificationEnabled"
                defaultChecked={data.notifications?.appleNotificationEnabled ?? false}
              />
              <span className="text-sm text-[color:var(--gos-text)]">
                Apple Notification Enabled
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="guestEmailEnabled"
                defaultChecked={data.notifications?.guestEmailEnabled ?? false}
              />
              <span className="text-sm text-[color:var(--gos-text)]">
                Guest Email Enabled
              </span>
            </label>
            <SubmitButton
              pendingLabel="Saving…"
              className="gos-button-primary w-full text-sm sm:w-auto"
            >
              Save Notification Settings
            </SubmitButton>
          </form>
        </SectionCard>

        <p className="text-sm text-[color:var(--gos-muted)]">
          Looking for hosts, doors, Home Assistant, or branding?{" "}
          <Link
            href="/admin"
            className="underline underline-offset-4 text-[color:var(--gos-primary)]"
          >
            Go to the Admin Dashboard
          </Link>
          .
        </p>
      </div>
    </AdminShell>
  );
}
