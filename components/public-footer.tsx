import Link from "next/link";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/sms-terms", label: "SMS Terms" },
  { href: "/support", label: "Support" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-[rgba(31,46,39,0.08)] bg-[rgba(255,255,255,0.66)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-[color:var(--gos-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>GuestOS guest access and concierge information.</p>
        <nav className="flex flex-wrap gap-4" aria-label="Public footer">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium text-[color:var(--gos-primary)] hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
