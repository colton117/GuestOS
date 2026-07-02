import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "SMS Terms | GuestOS",
  description: "SMS terms for GuestOS guest and host communications.",
};

export default function SmsTermsPage() {
  return (
    <PublicPageShell
      title="SMS Terms"
      description="GuestOS may use SMS for operational messages related to guest access and support."
    >
      <div className="space-y-4">
        <p>
          SMS communication is reserved for operational notices related to guest
          access, visit coordination, or support follow-up.
        </p>
        <p>
          Message frequency varies based on guest activity and property
          workflow. Standard message and data rates may apply from your mobile
          carrier.
        </p>
        <p>
          You can stop receiving SMS messages where supported by replying with
          the appropriate opt-out keyword provided in the message stream. Some
          operational notices may still be required for active visits or access
          requests.
        </p>
        <p>
          GuestOS does not use SMS for promotional messaging in this portal
          foundation.
        </p>
      </div>
    </PublicPageShell>
  );
}
