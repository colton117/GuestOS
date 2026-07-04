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
          <div className="h-3 w-28 rounded-full bg-[rgba(31,46,39,0.08)]" />
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div className="h-14 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
          <div className="h-14 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
          <div className="h-14 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
          <div className="h-14 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
          <div className="md:col-span-2 h-14 rounded-full bg-[rgba(31,46,39,0.08)]" />
        </div>
        </div>
        </div>
      </main>
    </div>
  );
}
