import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Lexend, Plus_Jakarta_Sans } from "next/font/google";
import { SkipLink } from "@/components/layout/skip-link";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const description =
  "Rangkul menyatukan informasi aksesibilitas tempat umum, direktori komunitas disabilitas, dan kegiatan volunteer inklusif di Indonesia.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Rangkul",
  title: {
    default: "Rangkul — Membantu Sesama, Ruang untuk Semua",
    template: "%s | Rangkul",
  },
  description,
  keywords: [
    "aksesibilitas",
    "disabilitas",
    "komunitas inklusif",
    "volunteer",
    "tempat ramah disabilitas",
    "Indonesia",
  ],
  authors: [{ name: "Rangkul" }],
  creator: "Rangkul",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Rangkul",
    title: "Rangkul — Membantu Sesama, Ruang untuk Semua",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Rangkul — Membantu Sesama, Ruang untuk Semua",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F7B6F",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${lexend.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-dvh bg-canvas font-sans text-ink antialiased">
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
