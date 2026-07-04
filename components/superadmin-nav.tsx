"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/hosts", label: "Hosts", icon: Users },
  { href: "/admin/property", label: "Property", icon: Building2 },
];

export function SuperadminNav() {
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
          </Link>
        );
      })}
    </nav>
  );
}
