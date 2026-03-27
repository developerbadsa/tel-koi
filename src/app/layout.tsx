import type { Metadata } from "next";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { env } from "@/lib/env";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "PetrolKoiLal",
  description: "লালমনিরহাটের মানুষে মিলে পেট্রোল/ডিজেল পাম্পের খবর",
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  alternates: {
    canonical: "/",
  },
  keywords: ["PetrolKoiLal", "Lalmonirhat", "Petrol", "Diesel", "Station", "Bangladesh", "Community Vote", "Fuel"],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    siteName: "PetrolKoiLal",
    title: "PetrolKoiLal",
    description: "লালমনিরহাটের মানুষে মিলে পেট্রোল/ডিজেল পাম্পের খবর",
    url: env.NEXT_PUBLIC_APP_URL,
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "PetrolKoiLal" }],
  },
  twitter: {
    card: "summary",
    title: "PetrolKoiLal",
    description: "লালমনিরহাটের মানুষে মিলে পেট্রোল/ডিজেল পাম্পের খবর",
    images: ["/logo.png"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "PetrolKoiLal",
        url: env.NEXT_PUBLIC_APP_URL,
      },
      {
        "@type": "WebSite",
        name: "PetrolKoiLal",
        url: env.NEXT_PUBLIC_APP_URL,
      },
    ],
  };

  return (
    <html lang={lang}>
      <body className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-3 py-4 md:px-4 md:py-6">{children}</main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
