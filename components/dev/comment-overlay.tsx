"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Dev-only "Edit Site" comment layer (Figma-style pins).
 *
 * This component is only ever mounted by <EditModeToggle> when
 * `process.env.NODE_ENV !== "production"` (see components/dev/edit-mode-toggle.tsx
 * and next.config.ts for how it's fully excluded from production bundles).
 *
 * Clicking an element in Edit Site mode does NOT edit it directly —
 * it drops a pin and opens a small note composer. On save, the note is
 * POSTed to /api/dev/site-comments, which appends a JSON record to
 * .claude/site-comments.json on disk. That file is read directly by a
 * separate coding-agent session later; this overlay never edits app
 * source itself.
 */

const IGNORE_SELECTOR = "[data-gos-edit-ui]";
const MAX_SNIPPET_LENGTH = 140;

export interface CommentTarget {
  tagName: string;
  textSnippet: string | null;
  classList: string;
}

export interface SourceFileRef {
  file: string;
  line: number | null;
}

export interface SiteCommentRecord {
  id: number;
  timestamp: string;
  pathname: string;
  target: CommentTarget;
  sourceFile: SourceFileRef | null;
  position: { xRatio: number; yRatio: number };
  text: string;
  status: "open" | "resolved";
}

type PendingPin = {
  position: { xRatio: number; yRatio: number };
  viewportPoint: { x: number; y: number };
  target: CommentTarget;
};

function getOwnText(el: HTMLElement): string {
  const ownText = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent ?? "")
    .join("")
    .trim();
  if (ownText.length > 0) return ownText;
  // Fall back to the element's full text content (trimmed/collapsed) so
  // clicking a container still gives the composer something to show and
  // gives the source resolver a shot at finding the right file.
  return (el.textContent ?? "").trim().replace(/\s+/g, " ");
}

function describeTarget(el: HTMLElement): CommentTarget {
  const text = getOwnText(el);
  return {
    tagName: el.tagName.toLowerCase(),
    textSnippet:
      text.length > 0 ? text.slice(0, MAX_SNIPPET_LENGTH) : null,
    classList: typeof el.className === "string" ? el.className : "",
  };
}

function docRatioFromViewportPoint(x: number, y: number) {
  const scrollX = window.scrollX || document.documentElement.scrollLeft;
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const docWidth = document.documentElement.scrollWidth || window.innerWidth;
  const docHeight =
    document.documentElement.scrollHeight || window.innerHeight;
  return {
    xRatio: (x + scrollX) / docWidth,
    yRatio: (y + scrollY) / docHeight,
  };
}

function viewportPointFromDocRatio(xRatio: number, yRatio: number) {
  const scrollX = window.scrollX || document.documentElement.scrollLeft;
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const docWidth = document.documentElement.scrollWidth || window.innerWidth;
  const docHeight =
    document.documentElement.scrollHeight || window.innerHeight;
  return {
    x: xRatio * docWidth - scrollX,
    y: yRatio * docHeight - scrollY,
  };
}

export function CommentOverlay({ onExit }: { onExit: () => void }) {
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  const [pending, setPending] = useState<PendingPin | null>(null);
  const [draftText, setDraftText] = useState("");
  const [comments, setComments] = useState<SiteCommentRecord[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [, forceTick] = useState(0);
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";

  const loadComments = useCallback(async () => {
    try {
      const response = await fetch("/api/dev/site-comments");
      const data = await response.json();
      if (data.ok) {
        setComments(data.comments as SiteCommentRecord[]);
      }
    } catch {
      // Non-fatal: the panel will just show no comments until reload.
    }
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleMouseOver = useCallback((event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest(IGNORE_SELECTOR)) return;
    setHovered(target);
  }, []);

  const handleClick = useCallback((event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest(IGNORE_SELECTOR)) return;

    event.preventDefault();
    event.stopPropagation();

    const viewportPoint = { x: event.clientX, y: event.clientY };
    const position = docRatioFromViewportPoint(viewportPoint.x, viewportPoint.y);

    setPending({
      position,
      viewportPoint,
      target: describeTarget(target),
    });
    setDraftText("");
    setStatus({ kind: "idle" });
  }, []);

  useEffect(() => {
    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, [handleMouseOver, handleClick]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (pending) {
          setPending(null);
        } else {
          onExit();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pending, onExit]);

  // Reposition pins on scroll/resize since they're stored as document-
  // relative ratios.
  useEffect(() => {
    function onViewportChange() {
      forceTick((n) => n + 1);
    }
    window.addEventListener("scroll", onViewportChange, true);
    window.addEventListener("resize", onViewportChange);
    return () => {
      window.removeEventListener("scroll", onViewportChange, true);
      window.removeEventListener("resize", onViewportChange);
    };
  }, []);

  async function submitComment() {
    if (!pending || draftText.trim().length === 0) {
      setStatus({ kind: "error", message: "Write a note before saving." });
      return;
    }

    setStatus({ kind: "saving" });
    try {
      const response = await fetch("/api/dev/site-comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          pathname,
          target: pending.target,
          position: pending.position,
          text: draftText.trim(),
        }),
      });
      const data = await response.json();
      if (data.ok) {
        setComments((prev) => [...prev, data.comment]);
        setPending(null);
        setDraftText("");
        setStatus({ kind: "idle" });
      } else {
        setStatus({ kind: "error", message: data.error ?? "Failed to save comment." });
      }
    } catch {
      setStatus({ kind: "error", message: "Request failed. Is the dev server running?" });
    }
  }

  async function setResolved(id: number, resolved: boolean) {
    try {
      const response = await fetch("/api/dev/site-comments", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status: resolved ? "resolved" : "open" }),
      });
      const data = await response.json();
      if (data.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? data.comment : c)),
        );
      }
    } catch {
      // Non-fatal; user can retry from the panel.
    }
  }

  async function removeComment(id: number) {
    try {
      const response = await fetch(
        `/api/dev/site-comments?id=${encodeURIComponent(String(id))}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (data.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      // Non-fatal; user can retry from the panel.
    }
  }

  const pinsOnThisPage = useMemo(
    () => comments.filter((c) => c.pathname === pathname && c.status === "open"),
    [comments, pathname],
  );

  return (
    <div data-gos-edit-ui>
      {/* Hover highlight */}
      {hovered && !pending ? (
        <HighlightBox target={hovered} color="rgba(59,130,246,0.6)" />
      ) : null}

      {/* Top bar */}
      <div
        data-gos-edit-ui
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2147483000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          background: "#111827",
          color: "#f9fafb",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      >
        <span style={{ fontWeight: 600, letterSpacing: "0.04em" }}>
          EDIT SITE MODE — click an element to leave a comment
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            data-gos-edit-ui
            onClick={() => setPanelOpen((v) => !v)}
            style={{
              background: "#374151",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "4px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {panelOpen ? "Hide" : "Show"} comments ({comments.length})
          </button>
          <button
            type="button"
            data-gos-edit-ui
            onClick={onExit}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "4px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Exit Edit Mode (Esc)
          </button>
        </div>
      </div>

      {/* Existing pins on this page */}
      {pinsOnThisPage.map((comment, index) => {
        const point = viewportPointFromDocRatio(
          comment.position.xRatio,
          comment.position.yRatio,
        );
        return (
          <div
            key={comment.id}
            data-gos-edit-ui
            title={comment.text}
            style={{
              position: "fixed",
              left: point.x - 12,
              top: point.y - 12,
              zIndex: 2147482998,
              width: 24,
              height: 24,
              borderRadius: "50% 50% 50% 4px",
              background: "#f59e0b",
              color: "#111827",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "ui-monospace, monospace",
              boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
              cursor: "default",
              transform: "rotate(-45deg)",
            }}
          >
            <span style={{ transform: "rotate(45deg)" }}>{index + 1}</span>
          </div>
        );
      })}

      {/* Pending pin marker */}
      {pending ? (
        <div
          data-gos-edit-ui
          style={{
            position: "fixed",
            left: pending.viewportPoint.x - 12,
            top: pending.viewportPoint.y - 12,
            zIndex: 2147482998,
            width: 24,
            height: 24,
            borderRadius: "50% 50% 50% 4px",
            background: "#ec4899",
            boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
            transform: "rotate(-45deg)",
          }}
        />
      ) : null}

      {/* Comment composer */}
      {pending ? (
        <div
          data-gos-edit-ui
          style={{
            position: "fixed",
            left: Math.min(pending.viewportPoint.x + 20, window.innerWidth - 320),
            top: Math.min(pending.viewportPoint.y, window.innerHeight - 260),
            zIndex: 2147483000,
            width: 300,
            background: "#1f2937",
            color: "#f9fafb",
            borderRadius: 10,
            padding: 14,
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>New comment on &lt;{pending.target.tagName}&gt;</strong>
            <button
              type="button"
              data-gos-edit-ui
              onClick={() => setPending(null)}
              style={{
                background: "transparent",
                color: "#9ca3af",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
              }}
              aria-label="Cancel"
            >
              ×
            </button>
          </div>
          {pending.target.textSnippet ? (
            <p style={{ color: "#9ca3af", margin: 0 }}>
              &quot;{pending.target.textSnippet}&quot;
            </p>
          ) : null}
          <textarea
            data-gos-edit-ui
            autoFocus
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="e.g. make this button bigger, this copy sounds off..."
            rows={4}
            style={{
              resize: "vertical",
              borderRadius: 6,
              border: "1px solid #374151",
              background: "#111827",
              color: "#f9fafb",
              padding: 8,
              font: "inherit",
            }}
          />
          <button
            type="button"
            data-gos-edit-ui
            disabled={status.kind === "saving"}
            onClick={submitComment}
            style={{
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 10px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {status.kind === "saving" ? "Saving…" : "Save comment"}
          </button>
          {status.kind === "error" ? (
            <p style={{ color: "#fca5a5", margin: 0 }}>{status.message}</p>
          ) : null}
        </div>
      ) : null}

      {/* Comments panel */}
      {panelOpen ? (
        <div
          data-gos-edit-ui
          style={{
            position: "fixed",
            top: 48,
            right: 16,
            bottom: 16,
            width: 320,
            overflowY: "auto",
            background: "#1f2937",
            color: "#f9fafb",
            borderRadius: 10,
            padding: 14,
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            zIndex: 2147482999,
          }}
        >
          <strong>Comments ({comments.length})</strong>
          {comments.length === 0 ? (
            <p style={{ color: "#9ca3af" }}>
              No comments yet. Click any element to leave one.
            </p>
          ) : (
            [...comments]
              .sort((a, b) => b.id - a.id)
              .map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    border: "1px solid #374151",
                    borderRadius: 8,
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    opacity: comment.status === "resolved" ? 0.55 : 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#9ca3af",
                    }}
                  >
                    <span>
                      #{comment.id} · &lt;{comment.target.tagName}&gt; ·{" "}
                      {comment.pathname}
                    </span>
                    <span>{comment.status}</span>
                  </div>
                  {comment.target.textSnippet ? (
                    <p style={{ margin: 0, color: "#9ca3af" }}>
                      &quot;{comment.target.textSnippet}&quot;
                    </p>
                  ) : null}
                  <p style={{ margin: 0 }}>{comment.text}</p>
                  {comment.sourceFile ? (
                    <p style={{ margin: 0, color: "#6b7280" }}>
                      {comment.sourceFile.file}
                      {comment.sourceFile.line
                        ? `:${comment.sourceFile.line}`
                        : ""}
                    </p>
                  ) : (
                    <p style={{ margin: 0, color: "#6b7280" }}>
                      source file: unresolved
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      data-gos-edit-ui
                      onClick={() =>
                        setResolved(comment.id, comment.status !== "resolved")
                      }
                      style={{
                        background: "#374151",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 8px",
                        fontSize: 11,
                        cursor: "pointer",
                        flex: 1,
                      }}
                    >
                      {comment.status === "resolved"
                        ? "Reopen"
                        : "Mark resolved"}
                    </button>
                    <button
                      type="button"
                      data-gos-edit-ui
                      onClick={() => removeComment(comment.id)}
                      style={{
                        background: "#7f1d1d",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 8px",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function HighlightBox({
  target,
  color,
}: {
  target: HTMLElement;
  color: string;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    function update() {
      setRect(target.getBoundingClientRect());
    }
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const interval = window.setInterval(update, 200);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      window.clearInterval(interval);
    };
  }, [target]);

  if (!rect) return null;

  return (
    <div
      data-gos-edit-ui
      style={{
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        border: `2px solid ${color}`,
        background: `${color.replace(/[\d.]+\)$/, "0.08)")}`,
        pointerEvents: "none",
        zIndex: 2147482999,
        boxSizing: "border-box",
      }}
    />
  );
}
