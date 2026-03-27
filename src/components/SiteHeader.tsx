"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeaderInfoStrip } from "@/components/HeaderInfoStrip";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[rgba(247,251,250,0.9)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(247,251,250,0.78)]">
      <div className={`mx-auto max-w-5xl px-3 transition-all duration-200 md:px-4 ${compact ? "py-1.5 md:py-2" : "py-2 md:py-3"}`}>
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0 text-xl font-black">
            <Image
              src="/logo.svg"
              className={`h-auto transition-all duration-200 ${compact ? "w-[72px] md:w-[116px]" : "w-[84px] md:w-[130px]"}`}
              alt={`${siteConfig.name} logo`}
              width={160}
              height={160}
              priority
            />
          </Link>
          <div className="min-w-0">
            <Link href="/" className="block text-sm font-black uppercase tracking-[0.16em] text-[color:var(--petrol-deep)] md:text-base">
              {siteConfig.shortName}
            </Link>
            <p className={`text-[color:var(--text-soft)] transition-all duration-200 ${compact ? "text-[10px] md:text-[11px]" : "text-[11px] md:text-xs"}`}>
              {siteConfig.district} fuel update board
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/about"
              className={`rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.72)] font-semibold text-[color:var(--text-muted)] transition-all duration-200 hover:border-[color:var(--petrol)] hover:text-[color:var(--petrol)] ${
                compact ? "px-2 py-1 text-[11px] md:text-xs" : "px-2.5 py-1.5 text-xs md:text-sm"
              }`}
            >
              আমাদের কথা
            </Link>
            <Link
              href="/add"
              className={`rounded-lg border border-[color:var(--fuel-deep)] bg-[var(--fuel-soft)] font-semibold text-[color:var(--fuel-deep)] transition-all duration-200 hover:border-[color:var(--petrol)] hover:bg-[rgba(244,182,61,0.92)] hover:text-[color:var(--petrol-deep)] ${
                compact ? "px-2 py-1 text-[11px] md:text-xs" : "px-2.5 py-1.5 text-xs md:px-3 md:text-sm"
              }`}
            >
              পাম্প যোগ করুন
            </Link>
          </div>
        </div>
        <div className={`overflow-hidden transition-all duration-200 ${compact ? "mt-1 max-h-12" : "mt-2 max-h-20 md:mt-2.5"}`}>
          <HeaderInfoStrip compact={compact} />
        </div>
      </div>
    </header>
  );
}
