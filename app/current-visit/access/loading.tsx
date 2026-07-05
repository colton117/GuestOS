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
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="space-y-6 lg:space-y-8">
          <div className="flex gap-2">
            <div className="h-10 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
            <div className="h-10 w-24 rounded-full bg-[rgba(31,46,39,0.08)]" />
            <div className="h-10 w-32 rounded-full bg-[rgba(31,46,39,0.08)]" />
            <div className="h-10 w-28 rounded-full bg-[rgba(31,46,39,0.08)]" />
          </div>

          <section className="gos-card p-6 sm:p-8">
            <div className="h-6 w-28 rounded-full bg-[rgba(31,46,39,0.08)]" />
            <div className="mt-4 space-y-3">
              <div className="h-10 w-40 rounded-full bg-[rgba(31,46,39,0.08)]" />
              <div className="h-4 w-full max-w-3xl rounded-full bg-[rgba(31,46,39,0.08)]" />
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="h-28 rounded-[24px] bg-[rgba(31,46,39,0.08)]" />
            <div className="h-28 rounded-[24px] bg-[rgba(31,46,39,0.08)]" />
            <div className="h-28 rounded-[24px] bg-[rgba(31,46,39,0.08)]" />
          </div>
        </div>
      </main>
    </div>
  );
}
