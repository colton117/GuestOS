import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Support | GuestOS",
  description:
    "GuestOS support contact information for portal access and operational questions.",
};

export default function SupportPage() {
  return (
    <PublicPageShell
      title="GuestOS Support"
      description="Contact GuestOS for portal access, visit coordination, and operational support."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Email
          </p>
          <a
            href="mailto:support@minterav.com"
            className="mt-2 block font-medium text-slate-950 underline"
          >
            support@minterav.com
          </a>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Phone
          </p>
          <a
            href="tel:+19038093025"
            className="mt-2 block font-medium text-slate-950 underline"
          >
            903-809-3025
          </a>
        </div>
      </div>

      <p>
        For urgent property access issues, contact the host directly. GuestOS
        support assists with portal access and operational questions but does not
        replace on-site host coordination during an active visit.
      </p>
    </PublicPageShell>
  );
}