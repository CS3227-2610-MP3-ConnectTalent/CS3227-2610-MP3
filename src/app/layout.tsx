import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Careers | Open roles",
  description: "Browse open roles by team and category.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
