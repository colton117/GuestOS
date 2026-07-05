import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { EditModeToggle } from "@/components/dev/edit-mode-toggle";
import { getBrandColors } from "@/lib/branding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GuestOS",
  description: "Guest and resident portal for GuestOS.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { primaryColor, accentColor } = await getBrandColors();
  const colorOverrides =
    primaryColor || accentColor
      ? `:root{${primaryColor ? `--gos-primary:${primaryColor};` : ""}${
          accentColor ? `--gos-accent:${accentColor};` : ""
        }}`
      : null;

  return (
    <html lang="en">
      <body>
        {colorOverrides ? <style>{colorOverrides}</style> : null}
        {children}
        {process.env.NODE_ENV !== "production" ? <EditModeToggle /> : null}
      </body>
    </html>
  );
}
