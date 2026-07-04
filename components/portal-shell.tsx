import type { ReactNode } from "react";
import { PortalNav } from "@/components/portal-nav";
import { PublicFooter } from "@/components/public-footer";

export function PortalShell({
  children,
  guestName,
}: {
  children: ReactNode;
  guestName?: string;
}) {
  return (
    <div className="gos-shell">
      <PortalNav guestName={guestName} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
