"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { StationCard } from "@/components/StationCard";
import { areas } from "@/i18n/dict";
import type { HomeDictionary, StationItem, TrendingRow } from "@/types/station";

const DynamicMap = dynamic(() => import("@/components/MapView").then((m) => m.MapView), { ssr: false });

type Props = {
  stations: StationItem[];
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
  tone: "petrol" | "fuel" | "mist";
};

const ITEMS_PER_PAGE = 20;

function suggestionTypeLabel(type: Suggestion["type"]) {
  if (type === "name") return "নাম";
  if (type === "area") return "এলাকা";
  return "ঠিকানা";
}

function TrendingBlock({ title, rows, tone }: TrendingBlockProps) {
  const toneClasses =
    tone === "petrol"
      ? "border-[color:var(--border)] bg-[rgba(19,84,79,0.08)]"
      : tone === "fuel"
        ? "border-[rgba(191,116,24,0.22)] bg-[rgba(244,182,61,0.16)]"
        : "border-[color:var(--border)] bg-[rgba(255,255,255,0.72)]";

  return (
    <article className={`rounded-2xl border p-4 ${toneClasses}`}>
      <h3 className="mb-3 text-sm font-bold text-[color:var(--petrol-deep)]">{title}</h3>
      {rows.length > 0 ? (
        <div className="space-y-2">
          {rows.map((r, idx) => (
            <div key={r._id.toString()} className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.74)] px-3 py-2 text-sm">
              <p className="line-clamp-1 font-medium text-[color:var(--text-muted)]">
                {idx + 1}. {r.station.name}
              </p>
              <span className="rounded-lg bg-[rgba(19,84,79,0.1)] px-2 py-0.5 text-xs font-semibold text-[color:var(--petrol)]">{r.total}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-[rgba(255,255,255,0.74)] px-3 py-2 text-sm text-[color:var(--text-soft)]">এখনও নতুন রিপোর্ট নেই।</p>
      )}
    </article>
  );
}

export function HomeTabs({ stations, trending, t }: Props) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return stations.filter((m) => {
      const areaOk = area ? m.area === area : true;
      const text = `${m.name} ${m.address ?? ""} ${m.area}`.toLowerCase();
      return areaOk && (!q || text.includes(q));
    });
  }, [stations, query, area]);

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];

    const seen = new Set<string>();
    const list: Suggestion[] = [];

    for (const m of stations) {
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
  }, [stations, query]);

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
          <div className="flex flex-col gap-2 rounded-2xl border border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(19,84,79,0.08),rgba(244,182,61,0.16))] p-1.5 sm:flex-row sm:items-center">
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
              className="w-full rounded-xl border border-transparent bg-[rgba(255,255,255,0.82)] px-4 py-2.5 text-sm text-[color:var(--text)] outline-none ring-[rgba(19,84,79,0.24)] transition focus:ring"
            />
            <a
              href="#list-section"
              className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-[var(--petrol)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--petrol-deep)] sm:w-auto"
            >
              খুঁজুন
            </a>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 z-20 mt-2 max-h-60 overflow-auto rounded-2xl border border-[color:var(--border)] bg-[rgba(247,251,250,0.96)] p-2 shadow-soft">
              {suggestions.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onMouseDown={() => onSuggestionPick(s.label)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-[rgba(19,84,79,0.08)]"
                >
                  <span className="line-clamp-1 text-sm text-[color:var(--text-muted)]">{s.label}</span>
                  <span className="rounded-full bg-[rgba(244,182,61,0.16)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--fuel-deep)]">{suggestionTypeLabel(s.type)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          aria-label="এলাকা বাছাই"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.74)] px-4 py-3 text-[color:var(--text)] outline-none ring-[rgba(19,84,79,0.24)] transition focus:ring"
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
        <div className="rounded-2xl border border-[color:var(--border)] bg-[rgba(19,84,79,0.09)] p-4">
          <p className="text-xs font-semibold tracking-wide text-[color:var(--petrol)]">দেখানো হচ্ছে</p>
          <p className="mt-1 text-2xl font-extrabold text-[color:var(--petrol-deep)]">{filtered.length}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.74)] p-4">
          <p className="text-xs font-semibold tracking-wide text-[color:var(--text-muted)]">এলাকার সংখ্যা</p>
          <p className="mt-1 text-2xl font-extrabold text-[color:var(--petrol-deep)]">{uniqueAreas}</p>
        </div>
        <div className="rounded-2xl border border-[rgba(191,116,24,0.2)] bg-[rgba(244,182,61,0.16)] p-4">
          <p className="text-xs font-semibold tracking-wide text-[color:var(--fuel-deep)]">চলতি রিপোর্ট</p>
          <p className="mt-1 text-2xl font-extrabold text-[color:var(--fuel-deep)]">{trendingTotal}</p>
        </div>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <a href="#list-section" className="shrink-0 rounded-full border border-[color:var(--border)] bg-[rgba(255,255,255,0.78)] px-4 py-2 text-sm font-medium text-[color:var(--text-muted)] transition hover:border-[color:var(--petrol)] hover:text-[color:var(--petrol)]">
          {t.list}
        </a>
        <a href="#map-section" className="shrink-0 rounded-full border border-[color:var(--border)] bg-[rgba(255,255,255,0.78)] px-4 py-2 text-sm font-medium text-[color:var(--text-muted)] transition hover:border-[color:var(--petrol)] hover:text-[color:var(--petrol)]">
          {t.map}
        </a>
        <a href="#trending-section" className="shrink-0 rounded-full border border-[color:var(--border)] bg-[rgba(255,255,255,0.78)] px-4 py-2 text-sm font-medium text-[color:var(--text-muted)] transition hover:border-[color:var(--petrol)] hover:text-[color:var(--petrol)]">
          {t.trending}
        </a>
      </div>

      <section id="list-section" className="space-y-3">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h3 className="text-lg font-bold text-[color:var(--petrol-deep)]">{t.list}</h3>
          <p className="text-sm text-[color:var(--text-soft)]">
            মোট {filtered.length}টি ফলাফল {filtered.length > 0 ? `(দেখানো হচ্ছে ${startItem}-${endItem})` : ""}
          </p>
        </div>
        {filtered.length > 0 ? (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {paginated.map((station) => (
                <StationCard
                  key={station._id.toString()}
                  station={station}
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
                  className="rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.78)] px-3 py-1.5 text-sm text-[color:var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
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
                      className={`rounded-lg px-3 py-1.5 text-sm ${
                        pageNumber === page
                          ? "bg-[var(--petrol)] text-white"
                          : "border border-[color:var(--border)] bg-[rgba(255,255,255,0.78)] text-[color:var(--text-muted)]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.78)] px-3 py-1.5 text-sm text-[color:var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  পরের
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-[rgba(191,116,24,0.2)] bg-[rgba(244,182,61,0.16)] p-4 text-sm text-[color:var(--fuel-deep)]">
            এই ফিল্টারে কোনো স্টেশন পাওয়া যায়নি।
          </div>
        )}
      </section>

      <section id="map-section" className="space-y-3">
        <h3 className="text-lg font-bold text-[color:var(--petrol-deep)]">{t.map}</h3>
        <DynamicMap stations={filtered} />
      </section>

      <section id="trending-section" className="space-y-3">
        <h3 className="text-lg font-bold text-[color:var(--petrol-deep)]">{t.trending}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <TrendingBlock title={t.topYes} rows={trending.topYes} tone="petrol" />
          <TrendingBlock title={t.topNo} rows={trending.topNo} tone="fuel" />
          <TrendingBlock title={t.mostActive} rows={trending.mostActive} tone="mist" />
        </div>
      </section>
    </section>
  );
}
