"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export type SystemLogEntryView = {
  id: string;
  level: string;
  category: string;
  message: string;
  actor: string | null;
  createdAtLabel: string;
  metadataJson: string | null;
};

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

function LogRow({ log }: { log: SystemLogEntryView }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="gos-panel gos-card-inner">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`gos-badge ${levelTone(log.level)}`}>{log.level}</span>
        <span className="gos-badge">{categoryLabel(log.category)}</span>
        <span className="text-xs text-[color:var(--gos-muted)]">
          {log.createdAtLabel}
        </span>
        {log.actor ? (
          <span className="text-xs text-[color:var(--gos-muted)]">
            · {log.actor}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-[color:var(--gos-text)]">{log.message}</p>
      {log.metadataJson ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="text-xs font-medium text-[color:var(--gos-muted)] underline underline-offset-4"
          >
            {expanded ? "Hide details" : "View details"}
          </button>
          {expanded ? (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-[rgba(31,46,39,0.04)] p-3 text-xs text-[color:var(--gos-text)]">
              {log.metadataJson}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function SystemLogList({ logs }: { logs: SystemLogEntryView[] }) {
  const errors = logs.filter((log) => log.level === "ERROR");

  if (logs.length === 0) {
    return (
      <p className="text-sm text-[color:var(--gos-muted)]">
        No events logged yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {errors.length > 0 ? (
        <div className="rounded-lg border border-[rgba(166,70,70,0.3)] bg-[rgba(166,70,70,0.08)] p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[color:var(--gos-error)]" />
            <p className="text-sm font-semibold text-[color:var(--gos-error)]">
              {errors.length} error{errors.length === 1 ? "" : "s"} recently
            </p>
          </div>
          <div className="mt-3 space-y-2">
            {errors.slice(0, 5).map((log) => (
              <p key={log.id} className="text-xs leading-5 text-[color:var(--gos-text)]">
                <span className="font-medium">{log.createdAtLabel}</span> —{" "}
                {log.message}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {logs.map((log) => (
          <LogRow key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}
