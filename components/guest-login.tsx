import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Building2 } from "lucide-react";
import {
  confirmSmsOptInAction,
  createGuestAction,
  lookupGuestAction,
  resendLoginCodeAction,
  verifyLoginCodeAction,
} from "@/lib/portal-actions";
import { getGuestBranding } from "@/lib/branding";
import { PublicFooter } from "@/components/public-footer";
import { SmsConsentCheckbox } from "@/components/sms-consent-checkbox";
import { PasskeyLoginButton } from "@/components/passkey-login-button";
import { PasskeySetupPrompt } from "@/components/passkey-setup-prompt";
import { GuestIdentifierForm } from "@/components/guest-identifier-form";

export async function GuestLogin({
  identifier,
  error,
  smsOptInPending,
  passkeySetupPending,
  destination,
  otpPending,
  sent,
}: {
  identifier?: string;
  error?: string;
  smsOptInPending?: string;
  passkeySetupPending?: string;
  destination?: string;
  otpPending?: string;
  sent?: string;
}) {
  const branding = await getGuestBranding();
  const isEmailIdentifier = identifier?.includes("@") ?? false;
  const showCreateForm = Boolean(identifier);
  const showSmsOptInPrompt = Boolean(smsOptInPending);
  const showPasskeySetupPrompt = Boolean(passkeySetupPending);
  const showOtpPending = Boolean(otpPending);
  const justSentCode = sent === "1";
  const safeDestination =
    destination && destination.startsWith("/") && !destination.startsWith("//")
      ? destination
      : "/current-visit";

  return (
    <>
      <main className="gos-shell flex min-h-screen items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="mx-auto grid w-full max-w-3xl gap-6">
          <section className="gos-card gos-fade-in overflow-hidden">
            <div className="space-y-6 p-5 sm:p-8">
              <div className="space-y-4">
                {branding.logoSrc ? (
                  <div className="inline-flex rounded-[28px] border border-[rgba(31,46,39,0.08)] bg-white p-4 shadow-sm">
                    <Image
                      src={branding.logoSrc}
                      alt="Apartment branding"
                      width={72}
                      height={72}
                      className="h-16 w-16 rounded-2xl object-contain"
                    />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <p className="gos-badge">GuestOS Login</p>
                  <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
                    {showPasskeySetupPrompt
                      ? "Faster sign-in next time?"
                      : showSmsOptInPrompt
                        ? "Stay in the loop"
                        : showOtpPending
                          ? "Check your email"
                          : showCreateForm
                            ? "Create your account"
                            : "Welcome"}
                  </h2>
                  <p className="text-base leading-7 text-[color:var(--gos-muted)]">
                    {showPasskeySetupPrompt
                      ? "Set up a passkey so you can sign in with Face ID, Touch ID, or Windows Hello instead of typing your info."
                      : showSmsOptInPrompt
                        ? "Get text updates about your visits and access. You can always change your mind later."
                        : showOtpPending
                          ? "We emailed you a 6-digit code. Enter it below to sign in."
                          : showCreateForm
                            ? "We couldn't find an account with that info. Fill in the rest to get set up."
                            : "Enter your email or phone number to sign in or create an account."}
                  </p>
                </div>
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {showPasskeySetupPrompt ? (
                <PasskeySetupPrompt destination={safeDestination} />
              ) : showOtpPending ? (
                <div className="space-y-4">
                  {justSentCode ? (
                    <p className="rounded-lg border border-[rgba(62,107,78,0.3)] bg-[rgba(62,107,78,0.12)] px-4 py-3 text-sm text-[color:var(--gos-success)]">
                      New code sent.
                    </p>
                  ) : null}
                  <form action={verifyLoginCodeAction} className="space-y-4">
                    <input type="hidden" name="guestId" value={otpPending} />
                    <label className="gos-label space-y-2">
                      <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                        6-digit code
                      </span>
                      <input
                        name="code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                        autoFocus
                        placeholder="123456"
                        className="gos-input text-center text-lg tracking-[0.3em]"
                      />
                    </label>
                    <button type="submit" className="gos-button-primary w-full text-sm">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                  <form action={resendLoginCodeAction}>
                    <input type="hidden" name="guestId" value={otpPending} />
                    <button
                      type="submit"
                      className="block w-full text-center text-sm text-[color:var(--gos-muted)] underline underline-offset-4"
                    >
                      Send a new code
                    </button>
                  </form>
                  <Link
                    href="/login"
                    className="block text-center text-sm text-[color:var(--gos-muted)] underline underline-offset-4"
                  >
                    Use a different email or phone
                  </Link>
                </div>
              ) : showSmsOptInPrompt ? (
                <form action={confirmSmsOptInAction} className="space-y-4">
                  <input type="hidden" name="guestId" value={smsOptInPending} />
                  <SmsConsentCheckbox required={false} />
                  <button type="submit" className="gos-button-primary w-full text-sm">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : showCreateForm ? (
                <form action={createGuestAction} className="space-y-4">
                  <input type="hidden" name="identifier" value={identifier} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="gos-label space-y-2">
                      <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                        First Name
                      </span>
                      <input
                        name="firstName"
                        required
                        autoFocus
                        className="gos-input text-sm"
                      />
                    </label>
                    <label className="gos-label space-y-2">
                      <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                        Last Name
                      </span>
                      <input name="lastName" required className="gos-input text-sm" />
                    </label>
                  </div>
                  <label className="gos-label space-y-2">
                    <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                      Email
                    </span>
                    <input
                      name="email"
                      type="email"
                      required
                      defaultValue={isEmailIdentifier ? identifier : ""}
                      className="gos-input text-sm"
                    />
                  </label>
                  <label className="gos-label space-y-2">
                    <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                      Phone
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      required
                      defaultValue={!isEmailIdentifier ? identifier : ""}
                      className="gos-input text-sm"
                    />
                  </label>

                  <SmsConsentCheckbox />

                  <button type="submit" className="gos-button-primary w-full text-sm">
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    href="/login"
                    className="block text-center text-sm text-[color:var(--gos-muted)] underline underline-offset-4"
                  >
                    Use a different email or phone
                  </Link>
                </form>
              ) : (
                <div className="space-y-4">
                  <PasskeyLoginButton />

                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-[rgba(31,46,39,0.08)]" />
                    <span className="text-xs uppercase tracking-[0.14em] text-[color:var(--gos-muted)]">
                      or
                    </span>
                    <span className="h-px flex-1 bg-[rgba(31,46,39,0.08)]" />
                  </div>

                  <GuestIdentifierForm action={lookupGuestAction} />
                </div>
              )}

              <div className="flex items-center justify-center gap-4 border-t border-[rgba(31,46,39,0.08)] pt-4 text-xs">
                <Link
                  href="/admin-login"
                  className="font-medium text-[color:var(--gos-muted)] underline underline-offset-4 hover:text-[color:var(--gos-primary)]"
                >
                  Host Dashboard
                </Link>
                <span aria-hidden="true" className="text-[color:var(--gos-muted)]">
                  &middot;
                </span>
                <Link
                  href="/superadmin-login"
                  className="font-medium text-[color:var(--gos-muted)] underline underline-offset-4 hover:text-[color:var(--gos-primary)]"
                >
                  Admin Dashboard
                </Link>
              </div>
            </div>
          </section>

          <div className="gos-card overflow-hidden">
            <div className="relative overflow-hidden px-6 py-7 sm:px-8 sm:py-10">
              <div className="absolute inset-0 bg-[rgba(31,46,39,0.04)]" />
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[rgba(168,138,90,0.14)] blur-3xl" />
              <div className="relative flex h-full flex-col justify-between gap-6">
                <div className="space-y-4">
                  <p className="gos-badge">GuestOS</p>
                  <div className="space-y-3">
                    <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-4xl lg:text-6xl">
                      Welcome to GuestOS.
                    </h1>
                    <p className="max-w-lg text-base leading-7 text-[color:var(--gos-muted)]">
                      Everything you need to check in, hosted by the people who live here.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="gos-panel p-4">
                    <Sparkles className="h-5 w-5 text-[color:var(--gos-accent)]" />
                    <p className="mt-3 text-sm font-medium text-[color:var(--gos-primary)]">
                      Easy to use
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--gos-muted)]">
                      Clear steps from arrival to checkout.
                    </p>
                  </div>
                  <div className="gos-panel p-4">
                    <ShieldCheck className="h-5 w-5 text-[color:var(--gos-accent)]" />
                    <p className="mt-3 text-sm font-medium text-[color:var(--gos-primary)]">
                      Private and secure
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--gos-muted)]">
                      Your information stays between you and your host.
                    </p>
                  </div>
                  <div className="gos-panel p-4">
                    <Building2 className="h-5 w-5 text-[color:var(--gos-accent)]" />
                    <p className="mt-3 text-sm font-medium text-[color:var(--gos-primary)]">
                      Works with your building
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--gos-muted)]">
                      We show property details when you need them, without getting in the way.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
