"use client";

import { useState } from "react";
import { CommentOverlay } from "@/components/dev/comment-overlay";

/**
 * Mounts the dev-only "Edit Site" toggle button + comment overlay.
 *
 * This component assumes its caller (app/layout.tsx) only renders it when
 * `process.env.NODE_ENV !== "production"`. That check is a statically
 * inlined constant in both Next's SWC build and webpack/Turbopack's
 * production bundling, so the entire <EditModeToggle /> reference — and
 * everything it transitively imports (CommentOverlay, the floating
 * button markup, the /api/dev/site-comments fetch calls, etc.) — is
 * dead-code eliminated from production output rather than merely hidden.
 * Do not render this component unconditionally elsewhere without
 * repeating that same NODE_ENV guard at the call site.
 */
export function EditModeToggle() {
  const [active, setActive] = useState(false);

  if (active) {
    return <CommentOverlay onExit={() => setActive(false)} />;
  }

  return (
    <button
      type="button"
      data-gos-edit-ui
      onClick={() => setActive(true)}
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 2147483000,
        background: "#111827",
        color: "#f9fafb",
        border: "1px solid #374151",
        borderRadius: 9999,
        padding: "10px 16px",
        fontSize: 12,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      }}
      title="Toggle Edit Site mode (dev only)"
    >
      Edit Site
    </button>
  );
}
