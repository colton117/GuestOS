import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Support | GuestOS",
  description: "GuestOS support and operational contact information.",
};

export default function SupportPage() {
  return (
    <PublicPageShell
      title="Support"
      description="Use these support channels for GuestOS portal access and operational questions."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            General Support
          </p>
          <p className="mt-2 font-medium text-slate-950">
            support@guestos.local
          </p>
          <p className="mt-1">Mon-Fri, 9:00 AM - 5:00 PM</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Urgent Access Issues
          </p>
          <p className="mt-2 font-medium text-slate-950">+1 (555) 010-2000</p>
          <p className="mt-1">For active visit and access coordination only.</p>
        </div>
      </div>
      <p>
        This support page is intended for the GuestOS foundation and operational
        use. It does not replace property-specific emergency procedures.
      </p>
    </PublicPageShell>
  );
}
