"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

/**
 * Modal state lives in the URL (a searchParam the caller controls), not
 * client state — matches this app's existing pattern of using links/redirects
 * to drive UI rather than client-side state machines. `closeHref` is where
 * the close button/backdrop/Escape key navigate to.
 */
export function Modal({
  open,
  closeHref,
  title,
  children,
}: {
  open: boolean;
  closeHref: string;
  title?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        router.push(closeHref);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeHref, router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(31,46,39,0.35)] px-4 py-6 backdrop-blur-sm"
      onClick={() => router.push(closeHref)}
    >
      <div
        className="gos-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title ? (
            <h2 className="text-xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <Link
            href={closeHref}
            aria-label="Close"
            className="gos-button-ghost -m-2 shrink-0 p-2"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
