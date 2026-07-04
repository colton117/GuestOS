export default function Loading() {
  return (
    <div className="gos-shell">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-20 rounded-full bg-[rgba(31,46,39,0.08)]" />
        <div className="h-8 w-72 rounded-[24px] bg-[rgba(31,46,39,0.08)]" />
      </div>

      <div className="gos-card overflow-hidden">
        <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
          <div className="h-3 w-32 rounded-full bg-[rgba(31,46,39,0.08)]" />
        </div>
        <div className="space-y-4 p-6">
          <div className="h-24 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
          <div className="h-24 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
          <div className="h-24 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
        </div>
        </div>
        </div>
      </main>
    </div>
  );
}
