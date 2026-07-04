export default function Loading() {
  return (
    <div className="gos-shell">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="space-y-6 lg:space-y-8">
          <section className="gos-card overflow-hidden">
            <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="h-6 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
                <div className="h-14 w-72 rounded-[24px] bg-[rgba(31,46,39,0.08)]" />
                <div className="h-4 w-full max-w-2xl rounded-full bg-[rgba(31,46,39,0.08)]" />
              </div>
              <div className="h-24 w-full max-w-xs rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
            </div>
          </section>
          <div className="gos-card overflow-hidden">
            <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
              <div className="h-3 w-28 rounded-full bg-[rgba(31,46,39,0.08)]" />
            </div>
            <div className="grid gap-5 p-6 md:grid-cols-2">
              <div className="h-24 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
              <div className="h-24 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
              <div className="h-24 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
              <div className="h-24 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
              <div className="md:col-span-2 h-14 rounded-full bg-[rgba(31,46,39,0.08)]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
