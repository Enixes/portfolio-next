import type { Metadata } from "next";
import "./globals.css";
import "./creative.css";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Asu Singh — Senior Software Engineer",
    template: "%s — Asu Singh",
  },
  description:
    "Senior Software Engineer focused on high-throughput backend systems, production reliability, and agentic AI.",
  keywords: [
    "Asu Singh",
    "Senior Software Engineer",
    "Java",
    "Backend Engineer",
    "Distributed Systems",
    "Agentic AI",
  ],
  authors: [{ name: "Asu Singh" }],
  creator: "Asu Singh",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    type: "website",
    title: "Asu Singh — Senior Software Engineer",
    description:
      "Backend engineering for environments where throughput, recovery, and reliability are not optional.",
    images: [
      {
        url: "/og.png",
        width: 1600,
        height: 1000,
        alt: "Asu Singh backend engineering portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asu Singh — Senior Software Engineer",
    description:
      "High-throughput systems, production reliability, and agentic AI.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
