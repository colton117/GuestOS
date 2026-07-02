import Link from "next/link";

export const SMS_CONSENT_LABEL =
  "I agree to receive transactional and operational SMS messages from GuestOS. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for support.";

export function SmsConsentCheckbox({ name = "smsConsent" }: { name?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-slate-200 px-4 py-3">
      <input
        type="checkbox"
        name={name}
        required
        className="mt-1 shrink-0"
      />
      <span className="text-sm leading-6 text-slate-700">
        {SMS_CONSENT_LABEL}{" "}
        <Link href="/sms-terms" className="font-medium text-slate-950 underline">
          SMS Terms
        </Link>
      </span>
    </label>
  );
}