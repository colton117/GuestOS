import type { Metadata } from "next";
import "@/styles/globals.css";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = {
  title: "GuestOS",
  description: "Resident guest management dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
