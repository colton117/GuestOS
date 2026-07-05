import { AdminShell } from "@/components/admin-shell";
import { SectionCard } from "@/components/section-card";
import { getRecentSystemLogs } from "@/lib/system-log";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function levelTone(level: string) {
  switch (level) {
    case "ERROR":
      return "bg-[rgba(166,70,70,0.12)] text-[color:var(--gos-error)]";
    case "WARN":
      return "bg-[rgba(184,138,46,0.14)] text-[color:var(--gos-warning)]";
    default:
      return "bg-[rgba(62,107,78,0.12)] text-[color:var(--gos-success)]";
  }
}

function categoryLabel(category: string) {
  switch (category) {
    case "host_action":
      return "Host";
    case "admin_action":
      return "Admin";
    case "access":
      return "Access";
    case "home_assistant":
      return "Home Assistant";
    case "auth":
      return "Sign-in";
    default:
      return category;
  }
}

export default async function LogsPage() {
  await requireAdminSession("/logs");

  const logs = await getRecentSystemLogs(150);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <p className="gos-section-title text-[0.72rem] font-semibold">
            Logs
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
          {logs.length === 0 ? (
            <p className="text-sm text-[color:var(--gos-muted)]">
              No events logged yet.
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="gos-panel gos-card-inner">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`gos-badge ${levelTone(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="gos-badge">
                      {categoryLabel(log.category)}
                    </span>
                    <span className="text-xs text-[color:var(--gos-muted)]">
                      {log.createdAt.toLocaleString()}
                    </span>
                    {log.actor ? (
                      <span className="text-xs text-[color:var(--gos-muted)]">
                        · {log.actor}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--gos-text)]">
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AdminShell>
  );
}
