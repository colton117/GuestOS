"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, KeyRound, LayoutGrid, MapPinned } from "lucide-react";

const tabs = [
  { href: "/current-visit", label: "Overview", icon: LayoutGrid },
  { href: "/current-visit/access", label: "Access", icon: KeyRound },
  { href: "/current-visit/property-map", label: "Property Map", icon: MapPinned },
  { href: "/current-visit/guide-me", label: "Guide Me", icon: Compass },
];

export function CurrentVisitTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-2"
      aria-label="Current visit sections"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`gos-button-secondary text-sm ${
              active
                ? "border-[color:var(--gos-primary)] bg-[color:var(--gos-primary)] text-white shadow-md"
                : ""
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
