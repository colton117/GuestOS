import Link from "next/link";
import { getDashboardData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getDashboardData();

  const cards = [
    {
      label: "Pending Requests",
      value: data.pendingRequests,
      href: "/requests",
    },
    {
      label: "Guests On Property",
      value: data.guestsOnProperty,
      href: "/visits",
    },
    {
      label: "Upcoming Visits",
      value: data.upcomingVisits,
      href: "/visits",
    },
    {
      label: "Quick Register",
      value: "Open",
      href: "/quick-register",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            GuestOS
          </h1>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <div className="mt-5 flex items-end justify-between gap-3">
              <span className="text-4xl font-semibold tracking-tight text-slate-950">
                {card.value}
              </span>
              <span className="text-sm font-medium text-slate-500">Open</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
