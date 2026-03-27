"use client";

import { useTransition } from "react";

export function LanguageToggle({ current }: { current: "en" | "bn" }) {
  const [pending, start] = useTransition();

  const setLang = (lang: "en" | "bn") => {
    start(async () => {
      await fetch("/api/set-lang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="বাংলা"
        onClick={() => setLang("en")}
        disabled={pending}
        className={`rounded-xl border px-3 py-1 text-sm ${current === "en" ? "border-orange-600 bg-orange-600 text-white" : "border-zinc-200 bg-white text-zinc-700"}`}
      >
        বাংলা
      </button>
      <button
        aria-label="রংপুরিয়া"
        onClick={() => setLang("bn")}
        disabled={pending}
        className={`rounded-xl border px-3 py-1 text-sm ${current === "bn" ? "border-orange-600 bg-orange-600 text-white" : "border-zinc-200 bg-white text-zinc-700"}`}
      >
        রংপুরিয়া
      </button>
    </div>
  );
}
