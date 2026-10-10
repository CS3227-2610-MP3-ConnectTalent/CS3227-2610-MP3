import type { Metadata } from "next";
import { Suspense } from "react";

import { AccountNavigation } from "@/components/account-navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Careers | Open roles",
  description: "Browse open roles by team and category.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense
          fallback={
            <div className="border-b px-5 py-5 text-sm text-muted-foreground">
              Loading account…
            </div>
          }
        >
          <AccountNavigation />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
