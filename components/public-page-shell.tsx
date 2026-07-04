import type { ReactNode } from "react";
import { PublicFooter } from "@/components/public-footer";

export function PublicPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="gos-shell">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="gos-card overflow-hidden">
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <div className="space-y-3">
              <p className="gos-badge">GuestOS</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-5xl">
              {title}
            </h1>
              <p className="max-w-2xl text-base leading-7 text-[color:var(--gos-muted)]">
                {description}
              </p>
            </div>
          </div>

          <div className="space-y-6 border-t border-[rgba(31,46,39,0.08)] px-6 py-6 text-sm leading-6 text-[color:var(--gos-text)] sm:px-8">
            {children}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
