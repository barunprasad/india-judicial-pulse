import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Hanken_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { Waveform } from "@phosphor-icons/react/dist/ssr";
import { NavDesktop, NavMobile } from "@/components/Nav";
import ScrollFX from "@/components/ScrollFX";
import { SITE } from "@/lib/site";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], style: ["italic"], weight: ["700", "800"], variable: "--font-hanken", display: "swap" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "India court backlog",
    "pending cases India",
    "NJDG",
    "eCourts",
    "judicial data",
    "case pendency",
    "clearance rate",
    "district courts",
    "High Courts",
    "Supreme Court of India",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: { canonical: "/" },
  category: "reference",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    locale: SITE.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#0b0c10", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${hanken.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <header className="topbar">
          <div className="wrap topbar-row">
            <Link href="/" className="brand" aria-label="India Judicial Pulse — home">
              <Waveform size={18} weight="bold" /> Judicial&nbsp;Pulse
            </Link>
            <NavDesktop />
          </div>
        </header>
        <main className="site">{children}</main>
        <NavMobile />
        <ScrollFX />
      </body>
    </html>
  );
}
