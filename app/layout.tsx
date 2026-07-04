import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { EditModeToggle } from "@/components/dev/edit-mode-toggle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GuestOS",
  description: "Guest and resident portal for GuestOS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.NODE_ENV !== "production" ? <EditModeToggle /> : null}
      </body>
    </html>
  );
}
