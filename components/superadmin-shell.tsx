import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { SuperadminNav } from "@/components/superadmin-nav";
import { superadminLogoutAction } from "@/lib/admin-auth-actions";

export function SuperadminShell({ children }: { children: ReactNode }) {
  return (
    <div className="gos-shell">
      <header className="border-b border-[rgba(31,46,39,0.08)] bg-[rgba(255,255,255,0.72)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="gos-section-title text-[0.72rem] font-semibold">
              GuestOS
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SuperadminNav />
            <form action={superadminLogoutAction}>
              <button type="submit" className="gos-button-ghost text-sm">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
