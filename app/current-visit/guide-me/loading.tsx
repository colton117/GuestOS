export default function Loading() {
  return (
    <div className="gos-shell">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="space-y-6 lg:space-y-8">
          <section className="gos-card overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4 px-6 py-8 sm:px-8 sm:py-10">
                <div className="h-6 w-32 rounded-full bg-[rgba(31,46,39,0.08)]" />
                <div className="h-14 w-full max-w-3xl rounded-[24px] bg-[rgba(31,46,39,0.08)]" />
                <div className="h-4 w-full max-w-2xl rounded-full bg-[rgba(31,46,39,0.08)]" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="h-20 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
                  <div className="h-20 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
                </div>
              </div>
              <div className="border-t border-[rgba(31,46,39,0.08)] px-6 py-8 sm:px-8 lg:border-l lg:border-t-0">
                <div className="space-y-4">
                  <div className="h-6 w-32 rounded-full bg-[rgba(31,46,39,0.08)]" />
                  <div className="h-28 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                  <div className="h-16 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                </div>
              </div>
            </div>
          </section>
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="gos-card overflow-hidden">
              <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
                <div className="h-3 w-28 rounded-full bg-[rgba(31,46,39,0.08)]" />
              </div>
              <div className="space-y-3 p-5 sm:p-6">
                <div className="h-24 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                <div className="h-24 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                <div className="h-24 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="gos-card overflow-hidden">
                <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
                  <div className="h-3 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
                </div>
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="h-14 rounded-[26px] bg-[rgba(31,46,39,0.06)]" />
                  <div className="h-32 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                  <div className="flex gap-3">
                    <div className="h-14 flex-1 rounded-full bg-[rgba(31,46,39,0.08)]" />
                    <div className="h-14 flex-1 rounded-full bg-[rgba(31,46,39,0.06)]" />
                  </div>
                </div>
              </div>
              <div className="gos-card overflow-hidden">
                <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
                  <div className="h-3 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
                </div>
                <div className="space-y-3 p-5 sm:p-6">
                  <div className="h-20 rounded-[26px] bg-[rgba(31,46,39,0.06)]" />
                  <div className="h-20 rounded-[26px] bg-[rgba(31,46,39,0.06)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
