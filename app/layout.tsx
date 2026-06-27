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
  title: "jin1abad | Pim2012",
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
        {/* Abstract Background Blobs - Sangat lembut dan samar agar tidak merusak fokus */}
        <div className="absolute top-0 right-0 -z-10 w-[550px] h-[550px] rounded-full bg-indigo-200/10 blur-[160px] pointer-events-none" />
        <div className="absolute top-[30vh] left-[-150px] -z-10 w-[650px] h-[650px] rounded-full bg-emerald-200/10 blur-[180px] pointer-events-none" />

        <Navbar />
        <main className="max-w-5xl mx-auto px-5 py-10 relative">{children}</main>
      </body>
    </html>
  );
}
