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
  { href: "/current-visit", label: "Current Visit", icon: Building2 },
  { href: "/vehicles", label: "Vehicles", icon: CarFront },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/visits", label: "History", icon: Clock3 },
];

export function PortalNav({ guestName }: { guestName?: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="border-b border-[rgba(31,46,39,0.08)] bg-[rgba(255,255,255,0.7)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
              <div className="rounded-full border border-[rgba(31,46,39,0.1)] bg-white px-4 py-2 text-sm text-[color:var(--gos-muted)] shadow-sm">
                {guestName}
              </div>
            ) : null}
            <Link
              href="/login"
              className="gos-button-ghost text-sm"
            >
              Switch Guest
            </Link>
            <form action={clearGuestAction}>
              <button
                type="submit"
                className="gos-button-ghost text-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </div>

        <nav
          className="-mx-1 flex gap-2 overflow-x-auto px-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
          aria-label="Portal"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`gos-button-secondary shrink-0 text-sm ${
                isActive(link.href)
                  ? "border-[color:var(--gos-primary)] bg-[color:var(--gos-primary)] text-white shadow-md"
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
