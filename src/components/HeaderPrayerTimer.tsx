"use client";

type Props = {
  compact?: boolean;
};

const tip = "লোকেশন দিতে গেলে পাম্পের গেটের কাছে পিন সেট করুন।";

export function HeaderPrayerTimer({ compact = false }: Props) {
  return (
    <div
      className={`w-full rounded-xl border border-orange-200 bg-orange-50 text-center shadow-sm transition-all duration-200 ${
        compact ? "px-2 py-1.5 md:px-2.5 md:py-2" : "px-2.5 py-2 md:px-3 md:py-2.5"
      }`}
    >
      <p className={`font-semibold text-orange-700 ${compact ? "text-[10px] md:text-[11px]" : "text-[11px] md:text-xs"}`}>পেট্রোল কই? কমিউনিটি আপডেট</p>
      <p className={`mt-0.5 text-zinc-700 ${compact ? "line-clamp-1 text-[11px] md:text-xs" : "line-clamp-2 text-xs md:text-sm"}`}>{tip}</p>
    </div>
  );
}
