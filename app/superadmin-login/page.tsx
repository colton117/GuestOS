import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { superadminLoginAction } from "@/lib/admin-auth-actions";
import { hasSuperadminSession } from "@/lib/admin-auth";
import { PublicFooter } from "@/components/public-footer";

export const dynamic = "force-dynamic";

type SuperadminLoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
  }>;
};

function safeNextPath(value: string | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/admin";
}

export default async function SuperadminLoginPage({
  searchParams,
}: SuperadminLoginPageProps) {
  const { next, error } = (await searchParams) ?? {};
  const safeNext = safeNextPath(next);

  if (await hasSuperadminSession()) {
    redirect(safeNext);
  }

  return (
    <>
      <main className="gos-shell flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="gos-card gos-fade-in w-full max-w-md overflow-hidden">
          <div className="space-y-6 p-6 sm:p-8">
            <div className="space-y-2">
              <p className="gos-badge">GuestOS Admin</p>
              <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--gos-primary)]">
                Operator sign-in
              </h1>
              <p className="text-base leading-7 text-[color:var(--gos-muted)]">
                Enter the superadmin password to manage hosts, property
                integrations, and branding.
              </p>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form action={superadminLoginAction} className="space-y-4">
              <input type="hidden" name="next" value={safeNext} />
              <label className="gos-label space-y-2">
                <span className="text-sm font-medium text-[color:var(--gos-primary)]">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  required
                  autoFocus
                  className="gos-input text-sm"
                />
              </label>
              <button type="submit" className="gos-button-primary w-full text-sm">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <Link
              href="/login"
              className="block text-center text-sm text-[color:var(--gos-muted)] underline underline-offset-4"
            >
              Back to guest sign-in
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
