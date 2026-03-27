"use client";

import { useState } from "react";

type Props = {
  stationId: string;
  compact?: boolean;
};

export function VoteButtons({ stationId, compact = false }: Props) {
  const [message, setMessage] = useState("");

  const vote = async (voteType: "YES" | "NO") => {
    const res = await fetch(`/api/stations/${stationId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteType }),
    });
    const data = await res.json();
    if (!res.ok && data.nextAllowedAt) {
      const mins = Math.max(1, Math.ceil((new Date(data.nextAllowedAt).getTime() - Date.now()) / 60000));
      setMessage(`আপনি আগেই ভোট দিয়েছেন। ${mins} মিনিট পর আবার চেষ্টা করুন।`);
      return;
    }
    if (!res.ok) {
      setMessage(data?.error ?? "ভোট নেওয়া গেল না");
      return;
    }
    setMessage("ভোট ধরা হয়েছে, ধন্যবাদ।");
    window.location.reload();
  };

  const buttonClass = compact ? "rounded-lg px-3 py-1.5 text-xs font-semibold transition" : "rounded-xl px-4 py-2 transition";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={`${buttonClass} bg-[var(--petrol)] text-white shadow-sm hover:bg-[var(--petrol-deep)]`} onClick={() => vote("YES")}>
          তেল আছে
        </button>
        <button
          type="button"
          className={`${buttonClass} border border-[color:var(--border-strong)] bg-[rgba(255,255,255,0.82)] text-[color:var(--text)] hover:border-[color:var(--fuel-deep)] hover:bg-[var(--fuel-soft)]`}
          onClick={() => vote("NO")}
        >
          তেল নেই
        </button>
      </div>
      {message && <p className="text-xs text-[color:var(--text-muted)]">{message}</p>}
    </div>
  );
}
