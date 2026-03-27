"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { MosqueCard } from "@/components/MosqueCard";
import { areas } from "@/i18n/dict";
import type { HomeDictionary, MosqueItem, TrendingRow } from "@/types/mosque";

const DynamicMap = dynamic(() => import("@/components/MapView").then((m) => m.MapView), { ssr: false });

type Props = {
  mosques: MosqueItem[];
  trending: {
    topYes: TrendingRow[];
    topNo: TrendingRow[];
    mostActive: TrendingRow[];
  };
  t: HomeDictionary;
};

type Suggestion = {
  key: string;
  label: string;
  type: "name" | "area" | "address";
};

type TrendingBlockProps = {
  title: string;
  rows: TrendingRow[];
  tone: "orange" | "stone" | "zinc";
};

const ITEMS_PER_PAGE = 20;

function suggestionTypeLabel(type: Suggestion["type"]) {
  if (type === "name") return "নাম";
  if (type === "area") return "এলাকা";
  return "ঠিকানা";
}

function TrendingBlock({ title, rows, tone }: TrendingBlockProps) {
  const toneClasses =
    tone === "orange"
      ? "border-orange-200 bg-orange-50/80"
      : tone === "stone"
        ? "border-stone-200 bg-stone-50"
        : "border-zinc-200 bg-zinc-50";

  return (
    <article className={`rounded-2xl border p-4 ${toneClasses}`}>
      <h3 className="mb-3 text-sm font-bold text-zinc-800">{title}</h3>
      {rows.length > 0 ? (
        <div className="space-y-2">
          {rows.map((r, idx) => (
            <div key={r._id.toString()} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
              <p className="line-clamp-1 font-medium text-zinc-700">
                {idx + 1}. {r.mosque.name}
              </p>
              <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700">{r.total}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-white px-3 py-2 text-sm text-zinc-500">এখনো নতুন রিপোর্ট নাই।</p>
      )}
    </article>
  );
}

export function HomeTabs({ mosques, trending, t }: Props) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return mosques.filter((m) => {
      const areaOk = area ? m.area === area : true;
      const text = `${m.name} ${m.address ?? ""} ${m.area}`.toLowerCase();
      return areaOk && (!q || text.includes(q));
    });
  }, [mosques, query, area]);

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];

    const seen = new Set<string>();
    const list: Suggestion[] = [];

    for (const m of mosques) {
      const candidates: Suggestion[] = [
        { key: `name-${m._id}`, label: m.name, type: "name" },
        { key: `area-${m._id}`, label: m.area, type: "area" },
      ];
      if (m.address) candidates.push({ key: `address-${m._id}`, label: m.address, type: "address" });

      for (const item of candidates) {
        if (!item.label.toLowerCase().includes(q)) continue;
        const dedupeKey = `${item.type}-${item.label.toLowerCase()}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        list.push(item);
        if (list.length >= 8) return list;
      }
    }

    return list;
  }, [mosques, query]);

  const uniqueAreas = useMemo(() => new Set(filtered.map((m) => m.area)).size, [filtered]);
  const trendingTotal = trending.topYes.length + trending.topNo.length + trending.mostActive.length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageStart = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [query, area]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const startItem = filtered.length === 0 ? 0 : pageStart + 1;
  const endItem = Math.min(pageStart + ITEMS_PER_PAGE, filtered.length);

  const onSuggestionPick = (value: string) => {
    setQuery(value);
    setShowSuggestions(false);
  };

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="grid gap-2 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <div className="flex flex-col gap-2 rounded-2xl border border-orange-200 bg-orange-50/70 p-1.5 sm:flex-row sm:items-center">
            <input
              aria-label="স্টেশন খোঁজ"
              value={query}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder={t.search}
              className="w-full rounded-xl border border-transparent bg-white px-4 py-2.5 text-sm outline-none ring-orange-300 transition focus:ring"
            />
            <a
              href="#list-section"
              className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 sm:w-auto"
            >
              খোঁজো
            </a>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 z-20 mt-2 max-h-60 overflow-auto rounded-2xl border border-orange-100 bg-white p-2 shadow-soft">
              {suggestions.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onMouseDown={() => onSuggestionPick(s.label)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-orange-50"
                >
                  <span className="line-clamp-1 text-sm text-zinc-700">{s.label}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">{suggestionTypeLabel(s.type)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          aria-label="এলাকা বাছাই"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full rounded-2xl border border-orange-200 bg-orange-50/70 px-4 py-3 outline-none ring-orange-300 transition focus:ring"
        >
          <option value="">{t.allAreas}</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 md:gap-3">
        <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-4">
          <p className="text-xs font-semibold tracking-wide text-orange-700">কয় জায়গায় তেল আছে</p>
          <p className="mt-1 text-2xl font-extrabold text-orange-900">{filtered.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-semibold tracking-wide text-zinc-600">কয়টা এলাকা</p>
          <p className="mt-1 text-2xl font-extrabold text-zinc-900">{uniqueAreas}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs font-semibold tracking-wide text-stone-700">চলতি রিপোর্ট</p>
          <p className="mt-1 text-2xl font-extrabold text-stone-900">{trendingTotal}</p>
        </div>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <a href="#list-section" className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
          {t.list}
        </a>
        <a href="#map-section" className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
          {t.map}
        </a>
        <a href="#trending-section" className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
          {t.trending}
        </a>
      </div>

      <section id="list-section" className="space-y-3">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h3 className="text-lg font-bold text-zinc-900">{t.list}</h3>
          <p className="text-sm text-zinc-500">
            মোট {filtered.length}টা ফল {filtered.length > 0 ? `(দেখাচ্ছে ${startItem}-${endItem})` : ""}
          </p>
        </div>
        {filtered.length > 0 ? (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {paginated.map((mosque) => (
                <MosqueCard
                  key={mosque._id.toString()}
                  mosque={mosque}
                  yesLabel={t.yes}
                  noLabel={t.no}
                  openMapsLabel={t.openMaps}
                  lastReportLabel={t.lastReport}
                />
              ))}
            </div>
            {filtered.length > ITEMS_PER_PAGE && (
              <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pt-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  আগের
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNumber = idx + 1;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={`rounded-lg px-3 py-1.5 text-sm ${pageNumber === page ? "bg-orange-600 text-white" : "border border-zinc-200 bg-white text-zinc-700"}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  পরের
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
            এই ফিল্টারে কোন লোকেশন পাওয়া গেল না।
          </div>
        )}
      </section>

      <section id="map-section" className="space-y-3">
        <h3 className="text-lg font-bold text-zinc-900">{t.map}</h3>
        <DynamicMap mosques={filtered} />
      </section>

      <section id="trending-section" className="space-y-3">
        <h3 className="text-lg font-bold text-zinc-900">{t.trending}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <TrendingBlock title={t.topYes} rows={trending.topYes} tone="orange" />
          <TrendingBlock title={t.topNo} rows={trending.topNo} tone="stone" />
          <TrendingBlock title={t.mostActive} rows={trending.mostActive} tone="zinc" />
        </div>
      </section>
    </section>
  );
}
