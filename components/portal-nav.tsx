"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CarFront,
  Clock3,
  LogOut,
  UserRound,
} from "lucide-react";
import { clearGuestAction } from "@/lib/portal-actions";

const links = [
  { href: "/current-visit", label: "Overview", icon: Building2 },
  { href: "/vehicles", label: "Vehicles", icon: CarFront },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/visits", label: "Activity", icon: Clock3 },
];

export function PortalNav({ guestName }: { guestName?: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(31,46,39,0.08)] bg-[rgba(255,255,255,0.82)] backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.75)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="gos-section-title text-[0.72rem] font-semibold">
              GuestOS
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
              Guest Portal
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {guestName ? (
              <div className="min-w-0 flex-1 truncate rounded-full border border-[rgba(31,46,39,0.1)] bg-white px-4 py-2 text-sm text-[color:var(--gos-muted)] shadow-sm sm:flex-none">
                {guestName}
              </div>
            ) : null}
            <form action={clearGuestAction}>
              <button
                type="submit"
                className="gos-button-ghost text-sm transition-transform duration-[180ms]"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>

        <nav
          className="relative -mx-1 flex gap-2 overflow-x-auto px-1 [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:[mask-image:none]"
          aria-label="Portal"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`gos-button-secondary shrink-0 text-sm ${
                isActive(link.href)
                  ? "border-[color:var(--gos-primary)] bg-[color:var(--gos-primary)] text-white shadow-md ring-1 ring-[rgba(31,46,39,0.1)]"
                  : ""
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
