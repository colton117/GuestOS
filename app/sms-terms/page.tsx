import type { Metadata } from "next";
import { ComplianceSection } from "@/components/compliance-section";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "SMS Terms | GuestOS",
  description:
    "SMS terms for GuestOS transactional and operational messages, including opt-out and support information.",
};

export default function SmsTermsPage() {
  return (
    <PublicPageShell
      title="SMS Terms"
      description="Terms for transactional and operational SMS messages sent by GuestOS."
    >
      <ComplianceSection title="Transactional SMS Only">
        <p>
          GuestOS sends transactional and operational SMS messages only. We do
          not use SMS for promotional or marketing purposes.
        </p>
      </ComplianceSection>

      <ComplianceSection title="Message Types">
        <p>GuestOS SMS messages may include:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Verification codes</li>
          <li>Visit updates</li>
          <li>Access notifications</li>
          <li>Parking notifications</li>
          <li>Host alerts</li>
          <li>Support-related messages</li>
        </ul>
      </ComplianceSection>

      <ComplianceSection title="Message Frequency">
        <p>
          Message frequency varies based on guest activity, visit status, and
          property workflow.
        </p>
      </ComplianceSection>

      <ComplianceSection title="Rates">
        <p>Message and data rates may apply depending on your mobile carrier.</p>
      </ComplianceSection>

      <ComplianceSection title="Opt Out">
        <p>
          Reply <strong>STOP</strong> to opt out of SMS messages where supported.
          After opting out, you may not receive operational visit notifications
          unless required for an active access request.
        </p>
      </ComplianceSection>

      <ComplianceSection title="Help">
        <p>
          Reply <strong>HELP</strong> for support, or contact us using the
          information below.
        </p>
      </ComplianceSection>

      <ComplianceSection title="Support Contact">
        <ul className="space-y-1">
          <li>
            Email:{" "}
            <a
              href="mailto:support@minterav.com"
              className="font-medium text-slate-950 underline"
            >
              support@minterav.com
            </a>
          </li>
          <li>
            Phone:{" "}
            <a
              href="tel:+19038093025"
              className="font-medium text-slate-950 underline"
            >
              903-809-3025
            </a>
          </li>
        </ul>
      </ComplianceSection>

      <ComplianceSection title="Consent">
        <p>Consent to receive SMS is not a condition of purchase.</p>
      </ComplianceSection>
    </PublicPageShell>
  );
}