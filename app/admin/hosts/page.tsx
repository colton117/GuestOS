import Link from "next/link";
import { SuperadminShell } from "@/components/superadmin-shell";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { deleteHostAction, saveHostAction } from "@/lib/settings-actions";
import { getSettingsData } from "@/lib/settings-data";
import { requireSuperadminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type AdminHostsPageProps = {
  searchParams?: Promise<{
    hostEdit?: string;
  }>;
};

export default async function AdminHostsPage({
  searchParams,
}: AdminHostsPageProps) {
  await requireSuperadminSession("/admin/hosts");

  const params = (await searchParams) ?? {};
  const data = await getSettingsData();
  const editingHost = params.hostEdit
    ? data.hosts.find((host) => host.id === params.hostEdit)
    : null;

  return (
    <SuperadminShell>
      <div className="space-y-6">
        <div>
          <p className="gos-section-title text-[0.72rem] font-semibold">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
            Hosts
          </h1>
        </div>

        <SectionCard title="Host">
          <div className="space-y-6">
            <form action={saveHostAction} className="grid gap-4 md:grid-cols-3">
              {editingHost ? (
                <input type="hidden" name="hostId" value={editingHost.id} />
              ) : null}
              <label className="gos-label space-y-2">
                <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                  Host Name
                </span>
                <input
                  name="name"
                  defaultValue={editingHost?.name ?? ""}
                  className="gos-input text-sm"
                />
              </label>
              <label className="gos-label space-y-2">
                <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                  Host Email
                </span>
                <input
                  name="email"
                  defaultValue={editingHost?.email ?? ""}
                  className="gos-input text-sm"
                />
              </label>
              <label className="gos-label space-y-2">
                <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                  Host Phone
                </span>
                <input
                  name="phone"
                  defaultValue={editingHost?.phone ?? ""}
                  className="gos-input text-sm"
                />
              </label>
              <div className="flex flex-col gap-2 sm:flex-row md:col-span-3">
                <SubmitButton
                  pendingLabel="Saving…"
                  className="gos-button-primary w-full text-sm sm:w-auto"
                >
                  {editingHost ? "Save Host" : "Add Host"}
                </SubmitButton>
                {editingHost ? (
                  <Link
                    href="/admin/hosts"
                    className="gos-button-secondary flex min-h-[44px] w-full items-center justify-center text-sm sm:w-auto"
                  >
                    Cancel
                  </Link>
                ) : null}
              </div>
            </form>

            <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              <table className="min-w-[560px] divide-y divide-[rgba(31,46,39,0.08)] sm:min-w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
                    <th className="px-4 py-3">Host Name</th>
                    <th className="px-4 py-3">Host Email</th>
                    <th className="px-4 py-3">Host Phone</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(31,46,39,0.08)]">
                  {data.hosts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-sm text-[color:var(--gos-muted)]"
                      >
                        No hosts configured yet.
                      </td>
                    </tr>
                  ) : (
                    data.hosts.map((host) => (
                      <tr key={host.id} className="text-sm text-[color:var(--gos-text)]">
                        <td className="px-4 py-4 font-medium text-[color:var(--gos-primary)]">
                          {host.name}
                        </td>
                        <td className="px-4 py-4">{host.email}</td>
                        <td className="px-4 py-4">{host.phone}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/admin/hosts?hostEdit=${host.id}`}
                              className="gos-button-secondary flex min-h-[44px] items-center justify-center px-3 py-2 text-xs"
                            >
                              Edit
                            </Link>
                            <form action={deleteHostAction}>
                              <input type="hidden" name="hostId" value={host.id} />
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
      </div>
    </SuperadminShell>
  );
}
