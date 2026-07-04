import type { ReactNode } from "react";

export function SectionCard({
  title,
  children,
  accent = false,
}: {
  title: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <section
      className={`gos-card gos-fade-in overflow-hidden ${
        accent ? "ring-2 ring-[color:var(--gos-warning)]" : ""
      }`}
    >
      <div
        className={`border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5 ${
          accent ? "bg-[rgba(184,138,46,0.08)]" : ""
        }`}
      >
        <h2 className="gos-section-title text-[0.72rem] font-semibold">
          {title}
        </h2>
      </div>
      <div className="gos-card-inner">{children}</div>
    </section>
  );
}
