import type { ReactNode } from "react";

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="gos-card gos-fade-in overflow-hidden">
      <div className="border-b border-[rgba(31,46,39,0.08)] px-6 py-5">
        <h2 className="gos-section-title text-[0.72rem] font-semibold">
          {title}
        </h2>
      </div>
      <div className="gos-card-inner">{children}</div>
    </section>
  );
}
