import Link from "next/link";
import Image from "next/image";
import { AdminShell } from "@/components/admin-shell";
import { SectionCard } from "@/components/section-card";
import {
  deleteDoorAction,
  deleteHostAction,
  saveBrandingAction,
  saveDoorAction,
  saveHostAction,
  saveHomeAssistantAction,
  saveNotificationAction,
  saveParkingAction,
  testHomeAssistantAction,
} from "@/lib/settings-actions";
import { getSettingsData } from "@/lib/settings-data";

export const dynamic = "force-dynamic";

type SettingsPageProps = {
  searchParams?: Promise<{
    hostEdit?: string;
    doorEdit?: string;
    haTest?: string;
  }>;
};

function getLogoSrc(
  logoData: Uint8Array | null | undefined,
  logoMimeType: string | null | undefined,
) {
  if (!logoData || !logoMimeType) {
    return null;
  }

  return `data:${logoMimeType};base64,${Buffer.from(logoData).toString("base64")}`;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = (await searchParams) ?? {};
  const data = await getSettingsData();
  const editingHost = params.hostEdit
    ? data.hosts.find((host) => host.id === params.hostEdit)
    : null;
  const editingDoor = params.doorEdit
    ? data.doors.find((door) => door.id === params.doorEdit)
    : null;
  const logoSrc = getLogoSrc(data.branding?.logoData, data.branding?.logoMimeType);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Settings
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Host Portal Settings
          </h1>
        </div>

        {params.haTest === "local-success" ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Connection test completed locally. Home Assistant is not connected yet.
          </div>
        ) : null}

        <SectionCard title="Host">
          <div className="space-y-6">
            <form action={saveHostAction} className="grid gap-4 md:grid-cols-3">
              {editingHost ? (
                <input type="hidden" name="hostId" value={editingHost.id} />
              ) : null}
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Host Name
                </span>
                <input
                  name="name"
                  defaultValue={editingHost?.name ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Host Email
                </span>
                <input
                  name="email"
                  defaultValue={editingHost?.email ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Host Phone
                </span>
                <input
                  name="phone"
                  defaultValue={editingHost?.phone ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <div className="md:col-span-3 flex gap-2">
                <button className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                  {editingHost ? "Save Host" : "Add Host"}
                </button>
                {editingHost ? (
                  <Link
                    href="/settings"
                    className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    Cancel
                  </Link>
                ) : null}
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-4 py-3">Host Name</th>
                    <th className="px-4 py-3">Host Email</th>
                    <th className="px-4 py-3">Host Phone</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.hosts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-sm text-slate-500"
                      >
                        No hosts configured yet.
                      </td>
                    </tr>
                  ) : (
                    data.hosts.map((host) => (
                      <tr key={host.id} className="text-sm text-slate-700">
                        <td className="px-4 py-4 font-medium text-slate-950">
                          {host.name}
                        </td>
                        <td className="px-4 py-4">{host.email}</td>
                        <td className="px-4 py-4">{host.phone}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/settings?hostEdit=${host.id}`}
                              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
                            >
                              Edit
                            </Link>
                            <form action={deleteHostAction}>
                              <input type="hidden" name="hostId" value={host.id} />
                              <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700">
                                Delete
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Parking">
            <form action={saveParkingAction} className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Current Quarterly Promo Code
                </span>
                <input
                  name="currentQuarterlyPromoCode"
                  defaultValue={data.parking?.currentQuarterlyPromoCode ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="parkingEnabled"
                  defaultChecked={data.parking?.parkingEnabled ?? true}
                />
                <span className="text-sm text-slate-700">Parking Enabled</span>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Maximum Parking Duration
                </span>
                <input
                  type="number"
                  name="maximumParkingDuration"
                  defaultValue={data.parking?.maximumParkingDuration ?? 24}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <button className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                Save Parking Settings
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Home Assistant">
            <div className="space-y-4">
              <form action={saveHomeAssistantAction} className="space-y-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">HA URL</span>
                  <input
                    name="haUrl"
                    defaultValue={data.homeAssistant?.haUrl ?? ""}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    HA Token
                  </span>
                  <input
                    name="haToken"
                    defaultValue={data.homeAssistant?.haToken ?? ""}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Webhook Timeout
                  </span>
                  <input
                    type="number"
                    name="webhookTimeout"
                    defaultValue={data.homeAssistant?.webhookTimeout ?? 10}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                  />
                </label>
                <button className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                  Save Home Assistant Settings
                </button>
              </form>

              <form action={testHomeAssistantAction}>
                <button className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">
                  Connection Test
                </button>
              </form>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Doors">
          <div className="space-y-6">
            <form action={saveDoorAction} className="grid gap-4 md:grid-cols-4">
              {editingDoor ? (
                <input type="hidden" name="doorId" value={editingDoor.id} />
              ) : null}
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Friendly Name
                </span>
                <input
                  name="friendlyName"
                  defaultValue={editingDoor?.friendlyName ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Home Assistant Action
                </span>
                <input
                  name="homeAssistantAction"
                  defaultValue={editingDoor?.homeAssistantAction ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Door Type
                </span>
                <select
                  name="doorType"
                  defaultValue={editingDoor?.doorType ?? "MANUAL_CODE"}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                >
                  <option value="BUTTERFLY">Butterfly</option>
                  <option value="SMARTRENT">SmartRent</option>
                  <option value="MANUAL_CODE">Manual Code</option>
                </select>
              </label>
              <label className="flex items-center gap-3 self-end pb-3">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={editingDoor?.enabled ?? true}
                />
                <span className="text-sm text-slate-700">Enabled</span>
              </label>
              <div className="md:col-span-4 flex gap-2">
                <button className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                  {editingDoor ? "Save Door" : "Add Door"}
                </button>
                {editingDoor ? (
                  <Link
                    href="/settings"
                    className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    Cancel
                  </Link>
                ) : null}
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-4 py-3">Friendly Name</th>
                    <th className="px-4 py-3">Home Assistant Action</th>
                    <th className="px-4 py-3">Enabled</th>
                    <th className="px-4 py-3">Door Type</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.doors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-sm text-slate-500"
                      >
                        No doors configured yet.
                      </td>
                    </tr>
                  ) : (
                    data.doors.map((door) => (
                      <tr key={door.id} className="text-sm text-slate-700">
                        <td className="px-4 py-4 font-medium text-slate-950">
                          {door.friendlyName}
                        </td>
                        <td className="px-4 py-4">{door.homeAssistantAction}</td>
                        <td className="px-4 py-4">
                          {door.enabled ? "Enabled" : "Disabled"}
                        </td>
                        <td className="px-4 py-4">
                          {door.doorType === "BUTTERFLY"
                            ? "Butterfly"
                            : door.doorType === "SMARTRENT"
                              ? "SmartRent"
                              : "Manual Code"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/settings?doorEdit=${door.id}`}
                              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
                            >
                              Edit
                            </Link>
                            <form action={deleteDoorAction}>
                              <input type="hidden" name="doorId" value={door.id} />
                              <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700">
                                Delete
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Notifications">
            <form action={saveNotificationAction} className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Host Email
                </span>
                <input
                  name="hostEmail"
                  defaultValue={data.notifications?.hostEmail ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="appleNotificationEnabled"
                  defaultChecked={data.notifications?.appleNotificationEnabled ?? false}
                />
                <span className="text-sm text-slate-700">
                  Apple Notification Enabled
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="guestEmailEnabled"
                  defaultChecked={data.notifications?.guestEmailEnabled ?? false}
                />
                <span className="text-sm text-slate-700">
                  Guest Email Enabled
                </span>
              </label>
              <button className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                Save Notification Settings
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Branding">
            <form action={saveBrandingAction} encType="multipart/form-data" className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Logo Upload
                </span>
                <input
                  type="file"
                  name="logoUpload"
                  accept="image/*"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt="Current logo"
                  width={160}
                  height={64}
                  unoptimized
                  className="h-16 w-auto rounded border border-slate-200 bg-white object-contain p-2"
                />
              ) : null}
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Welcome Message
                </span>
                <textarea
                  name="welcomeMessage"
                  defaultValue={data.branding?.welcomeMessage ?? ""}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
                />
              </label>
              <button className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                Save Branding
              </button>
            </form>
          </SectionCard>
        </div>
      </div>
    </AdminShell>
  );
}
