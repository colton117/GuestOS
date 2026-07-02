import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy | GuestOS",
  description:
    "Privacy policy for GuestOS guest portal and operational visitor records.",
};

export default function PrivacyPage() {
  return (
    <PublicPageShell
      title="Privacy Policy"
      description="GuestOS stores operational guest, vehicle, and visit records to support resident access management."
    >
      <div className="space-y-4">
        <p>
          GuestOS collects and stores information provided for guest access
          operations, including contact details, vehicle details, visit times,
          and request notes.
        </p>
        <p>
          This information is used to support scheduling, property access
          administration, and resident-host workflows. We do not use this page
          for marketing profiling or unrelated data processing.
        </p>
        <p>
          Access to operational records should be limited to authorized property
          staff and residents who need the information to manage a visit.
        </p>
        <p>
          For questions about data handling, contact support through the GuestOS
          support page.
        </p>
      </div>
    </PublicPageShell>
  );
}
