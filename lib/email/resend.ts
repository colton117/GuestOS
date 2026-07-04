const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "onboarding@resend.dev";

export class EmailError extends Error {
  override name = "EmailError";
}

async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new EmailError(
      "RESEND_API_KEY is not configured. Set it to send guest sign-in codes.",
    );
  }

  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `GuestOS <${from}>`,
      to: [options.to],
      subject: options.subject,
      text: options.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new EmailError(`Resend request failed (${response.status}): ${body}`);
  }
}

export async function sendGuestLoginCodeEmail(to: string, code: string): Promise<void> {
  await sendEmail({
    to,
    subject: `Your GuestOS sign-in code: ${code}`,
    text: `Your GuestOS sign-in code is ${code}.\n\nIt expires in 10 minutes. If you didn't request this, you can ignore this email.`,
  });
}
