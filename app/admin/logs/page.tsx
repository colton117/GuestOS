import { SuperadminShell } from "@/components/superadmin-shell";
import { SectionCard } from "@/components/section-card";
import { SystemLogList, type SystemLogEntryView } from "@/components/system-log-list";
import { getRecentSystemLogs } from "@/lib/system-log";
import { requireSuperadminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  await requireSuperadminSession("/admin/logs");

  const logs = await getRecentSystemLogs(150);
  const logViews: SystemLogEntryView[] = logs.map((log) => ({
    id: log.id,
    level: log.level,
    category: log.category,
    message: log.message,
    actor: log.actor,
    createdAtLabel: log.createdAt.toLocaleString(),
    metadataJson: log.metadata ? JSON.stringify(log.metadata, null, 2) : null,
  }));

  return (
    <SuperadminShell>
      <div className="space-y-6">
        <div>
          <p className="gos-section-title text-[0.72rem] font-semibold">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
            Activity &amp; system log
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--gos-muted)]">
            Host and admin actions, plus access attempts and system events like
            Home Assistant connectivity — most recent first.
          </p>
        </div>

        <SectionCard title="Recent Events">
          <SystemLogList logs={logViews} />
        </SectionCard>
      </div>
    </SuperadminShell>
  );
}
