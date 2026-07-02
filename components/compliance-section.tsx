import type { ReactNode } from "react";

export function ComplianceSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}