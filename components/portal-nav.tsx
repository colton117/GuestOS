import Link from "next/link";
import { clearGuestAction } from "@/lib/portal-actions";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/visits", label: "Visits" },
  { href: "/request-visit", label: "Request Visit" },
];

export function PortalNav({ guestName }: { guestName?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              GuestOS
            </p>
            <h1 className="mt-1 text-lg font-semibold text-slate-950">
              Guest Portal
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {guestName ? (
              <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
                {guestName}
              </div>
            ) : null}
            <Link
              href="/login"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-950"
            >
              Switch Guest
            </Link>
            <form action={clearGuestAction}>
              <button
                type="submit"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-950"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Portal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
