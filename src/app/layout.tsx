import type { Metadata } from "next";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.descriptionBn,
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  alternates: {
    canonical: "/",
  },
  keywords: [siteConfig.name, siteConfig.district, "petrol", "diesel", "octane", "fuel station", "Bangladesh", "community update"],
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
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.descriptionBn,
    url: env.NEXT_PUBLIC_APP_URL,
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary",
    title: siteConfig.name,
    description: siteConfig.descriptionBn,
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
        name: siteConfig.name,
        url: env.NEXT_PUBLIC_APP_URL,
      },
      {
        "@type": "WebSite",
        name: siteConfig.name,
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
