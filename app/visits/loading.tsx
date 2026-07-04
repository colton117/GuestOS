export default function Loading() {
  return (
    <div className="gos-shell">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="space-y-6 lg:space-y-8">
          <section className="gos-card overflow-hidden">
            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <div className="h-6 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
              <div className="mt-4 h-14 w-full max-w-3xl rounded-[24px] bg-[rgba(31,46,39,0.08)]" />
              <div className="mt-3 h-4 w-full max-w-2xl rounded-full bg-[rgba(31,46,39,0.08)]" />
            </div>
          </section>
          <div className="gos-card overflow-hidden">
            <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
              <div className="h-3 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
            </div>
            <div className="space-y-4 p-6">
              <div className="h-28 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
              <div className="h-28 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
            </div>
          </div>
          <div className="gos-card overflow-hidden">
            <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
              <div className="h-3 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
            </div>
            <div className="space-y-4 p-6">
              <div className="h-28 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
