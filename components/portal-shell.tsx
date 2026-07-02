import type { ReactNode } from "react";
import { PortalNav } from "@/components/portal-nav";

export function PortalShell({
  children,
  guestName,
}: {
  children: ReactNode;
  guestName?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PortalNav guestName={guestName} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
