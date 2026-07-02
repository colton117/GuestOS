import type { ReactNode } from "react";
import { PublicFooter } from "@/components/public-footer";

export function PublicPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              GuestOS
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">{description}</p>
          </div>

          <div className="mt-6 space-y-6 text-sm leading-6 text-slate-700">
            {children}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
