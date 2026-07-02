"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/guests", label: "Guests" },
  { href: "/requests", label: "Requests" },
  { href: "/quick-register", label: "Quick Register" },
  { href: "/settings", label: "Settings" },
];

export function AdminNav() {
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
              "rounded-lg border px-3 py-2 text-sm font-medium transition",
              active
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950",
            ].join(" ")}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
