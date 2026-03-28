"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  stationId: string;
  compact?: boolean;
};

export function VoteButtons({ stationId, compact = false }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const vote = async (voteType: "YES" | "NO") => {
    if (isSubmitting || isPending) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(`/api/stations/${stationId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      const data = await res.json();

      if (!res.ok && data.nextAllowedAt) {
        const mins = Math.max(1, Math.ceil((new Date(data.nextAllowedAt).getTime() - Date.now()) / 60000));
        setMessage(`আপনি একটু আগেই ভোট দিয়েছেন। ${mins} মিনিট পরে আবার চেষ্টা করুন।`);
        return;
      }

      if (!res.ok) {
        setMessage(data?.error ?? "ভোট নেওয়া গেল না");
        return;
      }

      setMessage("ভোট ধরা হয়েছে, ধন্যবাদ।");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setMessage("ভোট নেওয়া গেল না");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonClass = compact ? "rounded-lg px-3 py-1.5 text-xs font-semibold transition" : "rounded-xl px-4 py-2 transition";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={isSubmitting || isPending}
          className={`${buttonClass} bg-[var(--petrol)] text-white shadow-sm hover:bg-[var(--petrol-deep)] disabled:cursor-not-allowed disabled:opacity-60`}
          onClick={() => vote("YES")}
        >
          তেল আছে
        </button>
        <button
          type="button"
          disabled={isSubmitting || isPending}
          className={`${buttonClass} border border-[color:var(--border-strong)] bg-[rgba(255,255,255,0.82)] text-[color:var(--text)] hover:border-[color:var(--fuel-deep)] hover:bg-[var(--fuel-soft)] disabled:cursor-not-allowed disabled:opacity-60`}
          onClick={() => vote("NO")}
        >
          তেল নেই
        </button>
      </div>
      {message && <p className="text-xs text-[color:var(--text-muted)]">{message}</p>}
    </div>
  );
}
