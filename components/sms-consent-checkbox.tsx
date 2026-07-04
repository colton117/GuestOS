import Link from "next/link";

export const SMS_CONSENT_LABEL =
  "I agree to receive transactional and operational SMS messages from GuestOS. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for support.";

export function SmsConsentCheckbox({ name = "smsConsent" }: { name?: string }) {
  return (
    <label className="gos-panel flex items-start gap-3 px-4 py-4">
      <input
        type="checkbox"
        name={name}
        required
        className="mt-1 h-4 w-4 shrink-0 rounded border-[rgba(31,46,39,0.25)] text-[color:var(--gos-primary)]"
      />
      <span className="space-y-1 text-sm leading-6 text-[color:var(--gos-text)]">
        <span>{SMS_CONSENT_LABEL}</span>
        <span className="block">
          Review the full{" "}
          <Link
            href="/sms-terms"
            className="font-medium text-[color:var(--gos-primary)] underline decoration-[rgba(31,46,39,0.3)] decoration-2 underline-offset-4"
          >
            SMS Terms
          </Link>
          .
        </span>
      </span>
    </label>
  );
}
