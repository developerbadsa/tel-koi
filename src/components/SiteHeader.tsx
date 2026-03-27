"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "./../../public/logo.png";
import { HeaderPrayerTimer } from "@/components/HeaderPrayerTimer";

export function SiteHeader() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-orange-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className={`mx-auto max-w-5xl px-3 transition-all duration-200 md:px-4 ${compact ? "py-1.5 md:py-2" : "py-2 md:py-3"}`}>
        <div className="flex items-center gap-2">
          <Link href="/" className="shrink-0 text-xl font-black">
            <Image
              src={logo}
              className={`transition-all duration-200 ${compact ? "w-[72px] md:w-[116px]" : "w-[84px] md:w-[130px]"}`}
              alt="PetrolKoiLal Logo"
              width={130}
              height={0}
            />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/about"
              className={`rounded-lg border border-zinc-200 font-semibold text-zinc-700 transition-all duration-200 ${
                compact ? "px-2 py-1 text-[11px] md:text-xs" : "px-2.5 py-1.5 text-xs md:text-sm"
              }`}
            >
              আমাদের কথা
            </Link>
            <Link
              href="/add"
              className={`rounded-lg border border-orange-200 bg-orange-50 font-semibold text-orange-700 transition-all duration-200 hover:bg-orange-100 ${
                compact ? "px-2 py-1 text-[11px] md:text-xs" : "px-2.5 py-1.5 text-xs md:px-3 md:text-sm"
              }`}
            >
              পাম্প যোগ করুন
            </Link>
          </div>
        </div>
        <div className={`overflow-hidden transition-all duration-200 ${compact ? "mt-1 max-h-12" : "mt-2 max-h-20 md:mt-2.5"}`}>
          <HeaderPrayerTimer compact={compact} />
        </div>
      </div>
    </header>
  );
}
