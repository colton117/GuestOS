export default function Loading() {
  return (
    <div className="gos-shell">
      <div className="sticky top-0 z-50 border-b border-[rgba(31,46,39,0.08)] bg-[rgba(255,255,255,0.82)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded-full bg-[rgba(31,46,39,0.08)]" />
              <div className="h-6 w-32 rounded-full bg-[rgba(31,46,39,0.08)]" />
            </div>
            <div className="h-10 w-28 rounded-full bg-[rgba(31,46,39,0.08)]" />
          </div>
          <div className="flex gap-2 overflow-hidden">
            <div className="h-11 w-28 rounded-full bg-[rgba(31,46,39,0.08)]" />
            <div className="h-11 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
            <div className="h-11 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
            <div className="h-11 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="space-y-6 lg:space-y-8">
          <section className="gos-card overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5 px-6 py-7 sm:px-8 sm:py-10">
                <div className="h-6 w-32 rounded-full bg-[rgba(31,46,39,0.08)]" />
                <div className="space-y-3">
                  <div className="h-3 w-40 rounded-full bg-[rgba(31,46,39,0.08)]" />
                  <div className="h-14 w-full max-w-3xl rounded-[24px] bg-[rgba(31,46,39,0.08)]" />
                  <div className="h-4 w-full max-w-2xl rounded-full bg-[rgba(31,46,39,0.08)]" />
                  <div className="h-4 w-4/5 rounded-full bg-[rgba(31,46,39,0.08)]" />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="h-24 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                  <div className="h-24 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                  <div className="h-24 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                </div>
              </div>
              <div className="border-t border-[rgba(31,46,39,0.08)] px-6 py-7 sm:px-8 lg:border-l lg:border-t-0">
                <div className="space-y-4">
                  <div className="h-6 w-32 rounded-full bg-[rgba(31,46,39,0.08)]" />
                  <div className="h-28 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                  <div className="h-24 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                  <div className="space-y-3">
                    <div className="h-16 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                    <div className="h-16 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                    <div className="h-16 rounded-[28px] bg-[rgba(31,46,39,0.06)]" />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="gos-card overflow-hidden">
              <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
                <div className="h-3 w-28 rounded-full bg-[rgba(31,46,39,0.08)]" />
              </div>
              <div className="space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-24 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
                  <div className="h-24 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
                  <div className="h-24 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
                  <div className="h-24 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="gos-card overflow-hidden">
                <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
                  <div className="h-3 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
                </div>
                <div className="space-y-4 p-6">
                  <div className="h-6 w-2/3 rounded-full bg-[rgba(31,46,39,0.08)]" />
                  <div className="h-14 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
                </div>
              </div>
              <div className="gos-card overflow-hidden">
                <div className="border-b border-[rgba(31,46,39,0.08)] px-5 py-4 sm:px-6 sm:py-5">
                  <div className="h-3 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
                </div>
                <div className="space-y-4 p-6">
                  <div className="h-6 w-2/3 rounded-full bg-[rgba(31,46,39,0.08)]" />
                  <div className="h-14 rounded-[24px] bg-[rgba(31,46,39,0.06)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
