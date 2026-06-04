import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PickResearch",
    template: "%s | PickResearch",
  },
  description:
    "Sports research platform with live odds/news provider adapters, data-quality labels, player props, team trends, and AI betting analysis workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
