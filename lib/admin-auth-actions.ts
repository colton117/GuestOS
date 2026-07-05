"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  clearSuperadminSession,
  createAdminSession,
  createSuperadminSession,
  verifyAdminPassword,
  verifySuperadminPassword,
} from "@/lib/admin-auth";
import { logSystemEvent } from "@/lib/system-log";

function safeNextPath(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/host";
}

function safeSuperadminNextPath(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}

export async function adminLoginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (!verifyAdminPassword(password)) {
    await logSystemEvent({
      level: "WARN",
      category: "auth",
      message: "Failed host sign-in attempt",
      actor: "host",
    });
    redirect(
      `/admin-login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        "Incorrect password.",
      )}`,
    );
  }

  await createAdminSession();
  await logSystemEvent({
    category: "auth",
    message: "Host signed in",
    actor: "host",
  });
  redirect(next);
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect("/admin-login");
}

export async function superadminLoginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = safeSuperadminNextPath(String(formData.get("next") ?? ""));

  if (!verifySuperadminPassword(password)) {
    await logSystemEvent({
      level: "WARN",
      category: "auth",
      message: "Failed operator sign-in attempt",
      actor: "operator",
    });
    redirect(
      `/superadmin-login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        "Incorrect password.",
      )}`,
    );
  }

  await createSuperadminSession();
  await logSystemEvent({
    category: "auth",
    message: "Operator signed in",
    actor: "operator",
  });
  redirect(next);
}

export async function superadminLogoutAction() {
  await clearSuperadminSession();
  redirect("/superadmin-login");
}
