import { Mail, Phone, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { requireCurrentGuest } from "@/lib/portal";
import { updateProfileAction } from "@/lib/portal-actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const guest = await requireCurrentGuest();

  return (
    <PortalShell guestName={`${guest.firstName} ${guest.lastName}`}>
      <div className="space-y-6 lg:space-y-8">
        <section className="gos-card overflow-hidden">
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="gos-badge">Profile</p>
              <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--gos-primary)] sm:text-5xl">
                Guest profile
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[color:var(--gos-muted)]">
                Keep your guest identity current so your stay and future visits stay smooth.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-[28px] bg-[rgba(31,46,39,0.04)] px-5 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[color:var(--gos-primary)] text-white">
                <UserRound className="h-8 w-8" />
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

        <SectionCard title="Editable Details">
          <form action={updateProfileAction} className="grid gap-5 md:grid-cols-2">
            <Field label="First Name" icon={UserRound}>
              <input name="firstName" defaultValue={guest.firstName} className="gos-input" />
            </Field>
            <Field label="Last Name" icon={UserRound}>
              <input name="lastName" defaultValue={guest.lastName} className="gos-input" />
            </Field>
            <Field label="Email" icon={Mail}>
              <input name="email" defaultValue={guest.email} className="gos-input" />
            </Field>
            <Field label="Phone" icon={Phone}>
              <input name="phone" defaultValue={guest.phone} className="gos-input" />
            </Field>

            <div className="md:col-span-2 flex justify-end">
              <button className="gos-button-primary w-full sm:w-auto">
                Save Profile
              </button>
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
