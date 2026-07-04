import Link from "next/link";
import { SuperadminShell } from "@/components/superadmin-shell";
import { SectionCard } from "@/components/section-card";
import { getSettingsData } from "@/lib/settings-data";
import { requireSuperadminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireSuperadminSession("/admin");

  const [data, guestCount] = await Promise.all([
    getSettingsData(),
    prisma.guest.count(),
  ]);

  const enabledDoors = data.doors.filter((door) => door.enabled).length;

  return (
    <SuperadminShell>
      <div className="space-y-6">
        <div>
          <p className="gos-section-title text-[0.72rem] font-semibold">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
            Property overview
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="gos-panel gos-card-inner">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
              Hosts
            </p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--gos-primary)]">
              {data.hosts.length}
            </p>
          </div>
          <div className="gos-panel gos-card-inner">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
              Doors (Enabled)
            </p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--gos-primary)]">
              {enabledDoors} / {data.doors.length}
            </p>
          </div>
          <div className="gos-panel gos-card-inner">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--gos-muted)]">
              Guests On File
            </p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--gos-primary)]">
              {guestCount}
            </p>
          </div>
        </div>

        <SectionCard title="Quick Links">
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/hosts" className="gos-button-primary text-sm">
              Manage Hosts
            </Link>
            <Link href="/admin/property" className="gos-button-secondary text-sm">
              Manage Property
            </Link>
          </div>
        </SectionCard>
      </div>
    </SuperadminShell>
  );
}
