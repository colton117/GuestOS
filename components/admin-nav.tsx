"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  PenSquare,
  Settings2,
  Users,
} from "lucide-react";

const links = [
  { href: "/host", label: "Overview", icon: LayoutDashboard },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/requests", label: "Requests", icon: ClipboardList },
  { href: "/quick-register", label: "Quick Register", icon: PenSquare },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function AdminNav({ pendingRequestCount = 0 }: { pendingRequestCount?: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "gos-button-secondary text-sm",
              active
                ? "border-[color:var(--gos-primary)] bg-[color:var(--gos-primary)] text-white shadow-md"
                : "",
            ].join(" ")}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
            {link.href === "/requests" && pendingRequestCount > 0 ? (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--gos-warning)] px-1.5 text-xs font-semibold text-white">
                {pendingRequestCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
