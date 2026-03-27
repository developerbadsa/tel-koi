"use client";

type Props = {
  compact?: boolean;
};

const tip = "নতুন পাম্প যোগ করলে গেটের যত কাছে সম্ভব পিন বসান, তাহলে ম্যাপে খুঁজে পাওয়া সহজ হবে।";

export function HeaderInfoStrip({ compact = false }: Props) {
  return (
    <div
      className={`w-full rounded-xl border border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(19,84,79,0.08),rgba(244,182,61,0.18))] text-center shadow-sm transition-all duration-200 ${
        compact ? "px-2 py-1.5 md:px-2.5 md:py-2" : "px-2.5 py-2 md:px-3 md:py-2.5"
      }`}
    >
      <p className={`font-semibold text-[color:var(--petrol)] ${compact ? "text-[10px] md:text-[11px]" : "text-[11px] md:text-xs"}`}>
        পাম্প কোথায় খোলা আছে, কমিউনিটি ভোটে দেখে নিন
      </p>
      <p className={`mt-0.5 text-[color:var(--text-muted)] ${compact ? "line-clamp-1 text-[11px] md:text-xs" : "line-clamp-2 text-xs md:text-sm"}`}>{tip}</p>
    </div>
  );
}
