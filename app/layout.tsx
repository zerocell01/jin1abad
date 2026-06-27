import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
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
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${outfit.variable} ${jakarta.variable} ${mono.variable} font-body relative overflow-x-hidden min-h-screen`}
      >
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] rounded-full bg-indigo-200/25 blur-[120px] pointer-events-none" />
        <div className="absolute top-[30vh] left-[-100px] -z-10 w-[600px] h-[600px] rounded-full bg-emerald-200/20 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-[-100px] -z-10 w-[500px] h-[500px] rounded-full bg-violet-200/20 blur-[120px] pointer-events-none" />

        <Navbar />
        <main className="max-w-5xl mx-auto px-5 py-10 relative">{children}</main>
      </body>
    </html>
  );
}
