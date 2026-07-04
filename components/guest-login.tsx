import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Building2 } from "lucide-react";
import { selectGuestAction } from "@/lib/portal-actions";
import { getLoginGuests } from "@/lib/portal";
import { getGuestBranding } from "@/lib/branding";
import { PublicFooter } from "@/components/public-footer";

export async function GuestLogin() {
  const guests = await getLoginGuests();
  const branding = await getGuestBranding();

  return (
    <>
      <main className="gos-shell flex min-h-screen items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="gos-card overflow-hidden">
            <div className="relative min-h-[280px] overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
              <div className="absolute inset-0 bg-[rgba(31,46,39,0.04)]" />
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[rgba(168,138,90,0.14)] blur-3xl" />
              <div className="relative flex h-full flex-col justify-between gap-6">
                <div className="space-y-4">
                  <p className="gos-badge">GuestOS</p>
                  <div className="space-y-3">
                    <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-6xl">
                      Welcome to the guest experience.
                    </h1>
                    <p className="max-w-lg text-base leading-7 text-[color:var(--gos-muted)]">
                      Elegant, calm arrival handling for residents, guests, and hosts.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="gos-panel p-4">
                    <Sparkles className="h-5 w-5 text-[color:var(--gos-accent)]" />
                    <p className="mt-3 text-sm font-medium text-[color:var(--gos-primary)]">
                      Concierge-first
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--gos-muted)]">
                      Clear guidance from arrival to checkout.
                    </p>
                  </div>
                  <div className="gos-panel p-4">
                    <ShieldCheck className="h-5 w-5 text-[color:var(--gos-success)]" />
                    <p className="mt-3 text-sm font-medium text-[color:var(--gos-primary)]">
                      Private and secure
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--gos-muted)]">
                      Designed for a calm, trusted guest flow.
                    </p>
                  </div>
                  <div className="gos-panel p-4">
                    <Building2 className="h-5 w-5 text-[color:var(--gos-warning)]" />
                    <p className="mt-3 text-sm font-medium text-[color:var(--gos-primary)]">
                      Property-aware
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--gos-muted)]">
                      GuestOS remains primary while property details stay secondary.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="gos-card gos-fade-in overflow-hidden">
            <div className="space-y-6 p-6 sm:p-8">
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
                    Select your guest profile
                  </h2>
                  <p className="text-base leading-7 text-[color:var(--gos-muted)]">
                    Choose a guest to continue into the current visit workflow.
                  </p>
                </div>
              </div>

              <form action={selectGuestAction} className="space-y-4">
                <label className="gos-label space-y-2">
                  <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                    Select Guest
                  </span>
                  <select
                    name="guestId"
                    className="gos-input text-sm"
                    defaultValue={guests[0]?.id ?? ""}
                  >
                    <option value="" disabled>
                      Choose a guest
                    </option>
                    {guests.map((guest) => (
                      <option key={guest.id} value={guest.id}>
                        {guest.firstName} {guest.lastName} - {guest.email}
                      </option>
                    ))}
                  </select>
                </label>

                <button type="submit" className="gos-button-primary w-full text-sm">
                  Enter Portal
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </section>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
