"use client";

import { useState } from "react";

type Props = {
  mosqueId: string;
  compact?: boolean;
};

export function VoteButtons({ mosqueId, compact = false }: Props) {
  const [message, setMessage] = useState("");

  const vote = async (voteType: "YES" | "NO") => {
    const res = await fetch(`/api/stations/${mosqueId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteType }),
    });
    const data = await res.json();
    if (!res.ok && data.nextAllowedAt) {
      const mins = Math.max(1, Math.ceil((new Date(data.nextAllowedAt).getTime() - Date.now()) / 60000));
      setMessage(`তুমি আগেই ভোট দিছো। ${mins} মিনিট পর আবার দাও।`);
      return;
    }
    if (!res.ok) {
      setMessage(data?.error ?? "ভোট নেয়া গেল না");
      return;
    }
    setMessage("ভোট ধরা হইছে, ধন্যবাদ।");
    window.location.reload();
  };

  const buttonClass = compact
    ? "rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition"
    : "rounded-xl px-4 py-2 text-white";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button className={`${buttonClass} bg-orange-600 hover:bg-orange-700`} onClick={() => vote("YES")}>
          তেল আছে
        </button>
        <button className={`${buttonClass} bg-zinc-700 hover:bg-zinc-800`} onClick={() => vote("NO")}>
          তেল নাই
        </button>
      </div>
      {message && <p className="text-xs text-zinc-600">{message}</p>}
    </div>
  );
}
