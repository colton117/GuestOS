"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const SIZE_CLASSES = {
  md: "max-w-lg",
  lg: "max-w-3xl",
};

/**
 * Modal state usually lives in the URL (a searchParam the caller controls),
 * matching this app's existing pattern of using links/redirects to drive UI
 * rather than client-side state machines — pass `closeHref` for that case.
 * A few experiences (e.g. the Guide Me step flow) are driven by local client
 * state instead since they don't map cleanly to a URL; pass `onClose` there.
 * At least one of the two must be provided.
 */
export function Modal({
  open,
  closeHref,
  onClose,
  title,
  size = "md",
  children,
}: {
  open: boolean;
  closeHref?: string;
  onClose?: () => void;
  title?: string;
  size?: "md" | "lg";
  children: React.ReactNode;
}) {
  const router = useRouter();

  function close() {
    if (onClose) {
      onClose();
    } else if (closeHref) {
      router.push(closeHref);
    }
  }

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, closeHref, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(31,46,39,0.35)] px-4 py-6 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className={`gos-card max-h-[90vh] w-full ${SIZE_CLASSES[size]} overflow-y-auto p-6 sm:p-8`}
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
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="gos-button-ghost -m-2 shrink-0 p-2"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href={closeHref ?? "#"}
              aria-label="Close"
              className="gos-button-ghost -m-2 shrink-0 p-2"
            >
              <X className="h-4 w-4" />
            </Link>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
