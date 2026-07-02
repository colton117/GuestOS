import Link from "next/link";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/sms-terms", label: "SMS Terms" },
  { href: "/support", label: "Support" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>GuestOS guest access and support information.</p>
        <nav className="flex flex-wrap gap-4" aria-label="Public footer">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium text-slate-700 hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
