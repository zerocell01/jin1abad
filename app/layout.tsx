import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Jin1abad — Alumni Matholi'ul Falah Angkatan 2012",
  description:
    "Website Alumni Matholi'ul Falah Angkatan 2012 — cerita, galeri, dan direktori Jin1abad.",
  openGraph: {
    siteName: "Jin1abad",
    locale: "id_ID",
    type: "website",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#7A2E2E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${fraunces.variable} ${inter.variable} ${mono.variable} font-body`}
      >
        <Navbar />
        <main className="max-w-5xl mx-auto px-5 py-10">{children}</main>
      </body>
    </html>
  );
}
