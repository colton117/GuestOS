import { selectGuestAction } from "@/lib/portal-actions";
import { getLoginGuests } from "@/lib/portal";

export async function GuestLogin() {
  const guests = await getLoginGuests();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Login
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Guest Portal
          </h1>
          <p className="text-sm text-slate-600">
            Temporary development login. Select any guest to continue.
          </p>
        </div>

        <form action={selectGuestAction} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Select Guest
            </span>
            <select
              name="guestId"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-950"
              defaultValue={guests[0]?.id ?? ""}
            >
              <option value="" disabled>
                Choose a guest
              </option>
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {guest.firstName} {guest.lastName} - {guest.email}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-lg border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-medium text-white"
          >
            Enter Portal
          </button>
        </form>
      </section>
    </main>
  );
}
