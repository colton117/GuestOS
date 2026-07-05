import Link from "next/link";
import Image from "next/image";
import { SuperadminShell } from "@/components/superadmin-shell";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import {
  deleteDoorAction,
  saveBrandingAction,
  saveDoorAction,
  saveHomeAssistantAction,
  saveMaxParkingDurationAction,
  testHomeAssistantAction,
} from "@/lib/settings-actions";
import { getSettingsData } from "@/lib/settings-data";
import { requireSuperadminSession } from "@/lib/admin-auth";
import { Modal } from "@/components/ui/modal";
import { HexColorField } from "@/components/hex-color-field";
import type { DoorType } from "@prisma/client";

export const dynamic = "force-dynamic";

type AdminPropertyPageProps = {
  searchParams?: Promise<{
    doorEdit?: string;
    haTest?: string;
    haTestMessage?: string;
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

export default async function AdminPropertyPage({
  searchParams,
}: AdminPropertyPageProps) {
  await requireSuperadminSession("/admin/property");

  const params = (await searchParams) ?? {};
  const data = await getSettingsData();
  const editingDoor = params.doorEdit
    ? data.doors.find((door) => door.id === params.doorEdit)
    : null;
  const logoSrc = getLogoSrc(data.branding?.logoData, data.branding?.logoMimeType);

  return (
    <SuperadminShell>
      <div className="space-y-6">
        <div>
          <p className="gos-section-title text-[0.72rem] font-semibold">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
            Property Settings
          </h1>
        </div>

        {params.haTest === "success" ? (
          <div className="rounded-lg border border-[rgba(62,107,78,0.3)] bg-[rgba(62,107,78,0.12)] px-4 py-3 text-sm text-[color:var(--gos-success)]">
            Connected. Home Assistant responded successfully.
          </div>
        ) : null}
        {params.haTest === "failed" ? (
          <div className="rounded-lg border border-[rgba(166,70,70,0.3)] bg-[rgba(166,70,70,0.12)] px-4 py-3 text-sm text-[color:var(--gos-error)]">
            Connection failed: {params.haTestMessage ?? "Unknown error."}
          </div>
        ) : null}

        <SectionCard title="Home Assistant">
          <div className="space-y-4">
            <form action={saveHomeAssistantAction} className="space-y-4">
              <label className="gos-label space-y-2">
                <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                  HA URL
                </span>
                <input
                  name="haUrl"
                  defaultValue={data.homeAssistant?.haUrl ?? ""}
                  className="gos-input text-sm"
                />
              </label>
              <label className="gos-label space-y-2">
                <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                  HA Token
                </span>
                <input
                  name="haToken"
                  type="password"
                  autoComplete="off"
                  defaultValue={data.homeAssistant?.haToken ?? ""}
                  className="gos-input text-sm"
                />
              </label>
              <label className="gos-label space-y-2">
                <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                  Webhook Timeout
                </span>
                <input
                  type="number"
                  name="webhookTimeout"
                  defaultValue={data.homeAssistant?.webhookTimeout ?? 10}
                  className="gos-input text-sm"
                />
              </label>
              <SubmitButton
                pendingLabel="Saving…"
                className="gos-button-primary w-full text-sm sm:w-auto"
              >
                Save Home Assistant Settings
              </SubmitButton>
            </form>

            <form action={testHomeAssistantAction}>
              <SubmitButton
                pendingLabel="Testing…"
                className="gos-button-secondary w-full text-sm sm:w-auto"
              >
                Connection Test
              </SubmitButton>
            </form>
          </div>
        </SectionCard>

        <SectionCard title="Parking">
          <form action={saveMaxParkingDurationAction} className="space-y-4">
            <label className="gos-label space-y-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Maximum Parking Duration (Days)
              </span>
              <input
                type="number"
                name="maximumParkingDuration"
                defaultValue={data.parking?.maximumParkingDuration ?? 7}
                className="gos-input text-sm"
              />
            </label>
            <SubmitButton
              pendingLabel="Saving…"
              className="gos-button-primary w-full text-sm sm:w-auto"
            >
              Save Parking Settings
            </SubmitButton>
          </form>
        </SectionCard>

        <SectionCard title="Add Door">
          <form action={saveDoorAction} className="grid gap-4 md:grid-cols-4">
            <DoorFormFields />
            <div className="md:col-span-4">
              <SubmitButton
                pendingLabel="Saving…"
                className="gos-button-primary w-full text-sm sm:w-auto"
              >
                Add Door
              </SubmitButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Doors">
          <div className="space-y-6">
            <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              <table className="min-w-[720px] divide-y divide-[rgba(31,46,39,0.08)] sm:min-w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                    <th className="px-4 py-3">Friendly Name</th>
                    <th className="px-4 py-3">Home Assistant Action</th>
                    <th className="px-4 py-3">Enabled</th>
                    <th className="px-4 py-3">Door Type</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(31,46,39,0.08)]">
                  {data.doors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-sm text-[color:var(--gos-muted)]"
                      >
                        No doors configured yet.
                      </td>
                    </tr>
                  ) : (
                    data.doors.map((door) => (
                      <tr key={door.id} className="text-sm text-[color:var(--gos-text)]">
                        <td className="px-4 py-4 font-medium text-[color:var(--gos-primary)]">
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
                              href={`/admin/property?doorEdit=${door.id}`}
                              className="gos-button-secondary flex min-h-[44px] items-center justify-center px-3 py-2 text-xs"
                            >
                              Edit
                            </Link>
                            <form action={deleteDoorAction}>
                              <input type="hidden" name="doorId" value={door.id} />
                              <SubmitButton
                                pendingLabel="Deleting…"
                                className="gos-button-secondary min-h-[44px] px-3 py-2 text-xs"
                              >
                                Delete
                              </SubmitButton>
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

        <SectionCard title="Branding">
          <form action={saveBrandingAction} className="grid gap-4 md:grid-cols-2">
            <label className="gos-label space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Logo Upload
              </span>
              <input
                type="file"
                name="logoUpload"
                accept="image/*"
                className="gos-input text-sm"
              />
            </label>
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt="Current logo"
                width={160}
                height={64}
                unoptimized
                className="h-16 w-auto rounded border border-[rgba(31,46,39,0.08)] bg-white object-contain p-2 md:col-span-2"
              />
            ) : null}
            <label className="gos-label space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                Welcome Message
              </span>
              <textarea
                name="welcomeMessage"
                defaultValue={data.branding?.welcomeMessage ?? ""}
                rows={4}
                className="gos-input text-sm"
              />
            </label>
            <HexColorField
              name="primaryColor"
              label="Primary Color"
              defaultValue={data.branding?.primaryColor ?? "#1F2E27"}
            />
            <HexColorField
              name="accentColor"
              label="Accent Color"
              defaultValue={data.branding?.accentColor ?? "#A88A5A"}
            />
            <div className="md:col-span-2">
              <SubmitButton
                pendingLabel="Saving…"
                className="gos-button-primary w-full text-sm sm:w-auto"
              >
                Save Branding
              </SubmitButton>
            </div>
          </form>
        </SectionCard>
      </div>

      <Modal open={Boolean(editingDoor)} closeHref="/admin/property" title="Edit Door">
        {editingDoor ? (
          <form action={saveDoorAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="doorId" value={editingDoor.id} />
            <DoorFormFields defaultValues={editingDoor} />
            <div className="md:col-span-2">
              <SubmitButton
                pendingLabel="Saving…"
                className="gos-button-primary w-full text-sm sm:w-auto"
              >
                Save Door
              </SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>
    </SuperadminShell>
  );
}

function DoorFormFields({
  defaultValues,
}: {
  defaultValues?: {
    friendlyName: string;
    homeAssistantAction: string;
    doorType: DoorType;
    enabled: boolean;
  };
}) {
  return (
    <>
      <label className="gos-label space-y-2">
        <span className="text-sm font-medium text-[color:var(--gos-primary)]">
          Friendly Name
        </span>
        <input
          name="friendlyName"
          defaultValue={defaultValues?.friendlyName ?? ""}
          className="gos-input text-sm"
        />
      </label>
      <label className="gos-label space-y-2">
        <span className="text-sm font-medium text-[color:var(--gos-primary)]">
          Home Assistant Action
        </span>
        <input
          name="homeAssistantAction"
          defaultValue={defaultValues?.homeAssistantAction ?? ""}
          className="gos-input text-sm"
        />
      </label>
      <label className="gos-label space-y-2">
        <span className="text-sm font-medium text-[color:var(--gos-primary)]">
          Door Type
        </span>
        <select
          name="doorType"
          defaultValue={defaultValues?.doorType ?? "MANUAL_CODE"}
          className="gos-input text-sm"
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
          defaultChecked={defaultValues?.enabled ?? true}
        />
        <span className="text-sm text-[color:var(--gos-text)]">Enabled</span>
      </label>
    </>
  );
}
