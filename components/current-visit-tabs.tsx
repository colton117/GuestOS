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

/**
 * Deliberately NOT styled like PortalNav's pill buttons — an underline tab
 * strip reads as "sections within this page" rather than "another main nav",
 * which is what made this confusingly repetitive at a glance before.
 */
export function CurrentVisitTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-5 overflow-x-auto border-b border-[rgba(31,46,39,0.1)]"
      aria-label="Current visit sections"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 pb-2 pt-1 text-sm font-medium transition-colors ${
              active
                ? "border-[color:var(--gos-primary)] text-[color:var(--gos-primary)]"
                : "border-transparent text-[color:var(--gos-muted)] hover:text-[color:var(--gos-primary)]"
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
