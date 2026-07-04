import { Mail, Phone, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { requireCurrentGuest } from "@/lib/portal";
import { updateProfileAction } from "@/lib/portal-actions";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const guest = await requireCurrentGuest();
  const { error } = (await searchParams) ?? {};

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <div className="space-y-6 lg:space-y-8">
        <section className="gos-card overflow-hidden gos-fade-in">
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="gos-badge">Profile</p>
              <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-5xl">
                Your profile
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[color:var(--gos-muted)]">
                Keep your contact info up to date so we can reach you during your stay.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-[28px] bg-[rgba(31,46,39,0.04)] px-5 py-4 shadow-sm">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[color:var(--gos-primary)] text-white">
                <UserRound className="h-9 w-9" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--gos-muted)]">
                  Account
                </p>
                <p className="mt-1 text-lg font-semibold text-[color:var(--gos-primary)]">
                  {guest.firstName} {guest.lastName}
                </p>
              </div>
            </div>
          </div>
        </section>

        <SectionCard title="Your Details">
          {error === "invalid" ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Please check your name, email, and phone number and try again.
            </div>
          ) : null}
          <form action={updateProfileAction} className="grid gap-5 md:grid-cols-2">
            <Field label="First Name" icon={UserRound}>
              <input
                name="firstName"
                defaultValue={guest.firstName}
                autoComplete="given-name"
                className="gos-input"
              />
            </Field>
            <Field label="Last Name" icon={UserRound}>
              <input
                name="lastName"
                defaultValue={guest.lastName}
                autoComplete="family-name"
                className="gos-input"
              />
            </Field>
            <Field label="Email" icon={Mail}>
              <input
                name="email"
                defaultValue={guest.email}
                autoComplete="email"
                className="gos-input"
              />
            </Field>
            <Field label="Phone" icon={Phone}>
              <input
                name="phone"
                defaultValue={guest.phone}
                autoComplete="tel"
                className="gos-input"
              />
            </Field>

            <div className="md:col-span-2 flex justify-end pt-2">
              <SubmitButton
                pendingLabel="Saving…"
                className="gos-button-primary w-full sm:w-auto"
              >
                Save Changes
              </SubmitButton>
            </div>
          </form>
        </SectionCard>
      </div>
    </PortalShell>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof UserRound;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="flex items-center gap-2 text-sm font-medium text-[color:var(--gos-primary)]">
        <Icon className="h-4 w-4 text-[color:var(--gos-accent)]" />
        {label}
      </span>
      {children}
    </label>
  );
}
