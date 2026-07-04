// Production stand-in for components/dev/edit-mode-toggle.tsx.
//
// next.config.ts aliases the real dev-only "Edit Site" component to this
// stub whenever webpack's `dev` flag is false (i.e. `next build` / `next
// start`), so the actual overlay code (hover highlighting, click
// handlers, the fetch() call to /api/dev/edit-source, etc.) is never
// resolved into the production dependency graph at all — not merely
// rendered to null at runtime. This file intentionally renders nothing.
export function EditModeToggle() {
  return null;
}
