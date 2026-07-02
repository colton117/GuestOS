import type { Metadata } from "next";
import { ComplianceSection } from "@/components/compliance-section";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy | GuestOS",
  description:
    "How GuestOS collects, uses, and protects guest information for visit management, parking, and property access.",
};

export default function PrivacyPage() {
  return (
    <PublicPageShell
      title="Privacy Policy"
      description="How GuestOS handles guest and visit information for property access operations."
    >
      <ComplianceSection title="Information We Collect">
        <p>GuestOS may collect and store the following information:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Vehicle information</li>
          <li>Visit details, including arrival and departure times</li>
          <li>Access permissions for parking, building, and apartment access</li>
        </ul>
      </ComplianceSection>

      <ComplianceSection title="How We Use Information">
        <p>We use collected information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Verify guest accounts and identity</li>
          <li>Manage visits and access requests</li>
          <li>Coordinate parking assignments and notifications</li>
          <li>Facilitate property and building access</li>
          <li>Send operational notifications related to visits</li>
          <li>Provide customer support</li>
        </ul>
      </ComplianceSection>

      <ComplianceSection title="SMS Usage">
        <p>
          GuestOS may send transactional and operational SMS messages related to
          account verification, visit updates, access notifications, parking
          updates, and support. Message frequency varies. See our{" "}
          <a href="/sms-terms" className="font-medium text-slate-950 underline">
            SMS Terms
          </a>{" "}
          for details.
        </p>
      </ComplianceSection>

      <ComplianceSection title="Sale of Personal Information">
        <p>GuestOS does not sell personal information.</p>
      </ComplianceSection>

      <ComplianceSection title="Third-Party Service Providers">
        <p>
          GuestOS may use trusted third-party service providers to operate the
          platform, including services for hosting, messaging, email delivery,
          and infrastructure. These providers process information only as needed
          to perform services on our behalf.
        </p>
      </ComplianceSection>

      <ComplianceSection title="Data Retention">
        <p>
          We retain guest and visit information for as long as needed to manage
          active visits, support property operations, meet legal obligations,
          and resolve disputes. Retention periods may vary based on property
          requirements and operational needs.
        </p>
      </ComplianceSection>

      <ComplianceSection title="Security">
        <p>
          GuestOS uses reasonable administrative, technical, and organizational
          safeguards designed to protect personal information. No method of
          transmission or storage is completely secure, and we cannot guarantee
          absolute security.
        </p>
      </ComplianceSection>

      <ComplianceSection title="Contact">
        <p>
          For privacy questions, contact{" "}
          <a
            href="mailto:support@minterav.com"
            className="font-medium text-slate-950 underline"
          >
            support@minterav.com
          </a>
          .
        </p>
      </ComplianceSection>
    </PublicPageShell>
  );
}