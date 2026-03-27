import Link from "next/link";
import { VoteButtons } from "@/components/VoteButtons";
import { formatTime } from "@/lib/format";
import type { StationItem } from "@/types/station";

type Props = {
  station: StationItem;
  yesLabel: string;
  noLabel: string;
  openMapsLabel: string;
  lastReportLabel: string;
};

export function StationCard({ station, yesLabel, noLabel, openMapsLabel, lastReportLabel }: Props) {
  const [lng, lat] = station.location.coordinates;
  const totalVotes = station.aggregates.yesCount + station.aggregates.noCount;
  const confidence = Math.round((station.aggregates.confidenceScore ?? 0) * 100);

  return (
    <article className="group rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.82)] p-3.5 shadow-soft transition hover:-translate-y-0.5 hover:border-[color:var(--border-strong)] md:p-4">
      <div className="flex items-start justify-between gap-2.5">
        <div>
          <p className="mb-1.5 inline-flex rounded-full border border-[rgba(191,116,24,0.18)] bg-[rgba(244,182,61,0.18)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--fuel-deep)]">
            কমিউনিটি যাচাই
          </p>
          <Link className="line-clamp-2 text-base font-bold leading-snug text-[color:var(--petrol-deep)] hover:text-[color:var(--petrol)] hover:underline" href={`/station/${station._id}`}>
            {station.name}
          </Link>
          <p className="mt-0.5 text-sm font-medium text-[color:var(--text-muted)]">{station.area}</p>
          <p className="line-clamp-1 text-xs text-[color:var(--text-soft)]">{station.address || "ঠিকানা পাওয়া যায়নি"}</p>
        </div>
        <span className="shrink-0 rounded-lg border border-[color:var(--border)] bg-[rgba(19,84,79,0.08)] px-2 py-1 text-[11px] font-semibold text-[color:var(--petrol)]">
          {totalVotes} ভোট
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border border-[color:var(--border)] bg-[rgba(19,84,79,0.09)] px-3 py-2 text-[color:var(--petrol-deep)]">
          <p className="text-xs font-semibold tracking-wide">{yesLabel}</p>
          <p className="mt-0.5 text-lg font-extrabold">{station.aggregates.yesCount}</p>
        </div>
        <div className="rounded-xl border border-[rgba(191,116,24,0.2)] bg-[rgba(244,182,61,0.16)] px-3 py-2 text-[color:var(--fuel-deep)]">
          <p className="text-xs font-semibold tracking-wide">{noLabel}</p>
          <p className="mt-0.5 text-lg font-extrabold">{station.aggregates.noCount}</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-[color:var(--text-soft)]">
          <p>বিশ্বাসের মান</p>
          <p className="font-semibold text-[color:var(--text-muted)]">{confidence}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(19,84,79,0.12)]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#13544f] via-[#1f7a71] to-[#f4b63d]" style={{ width: `${confidence}%` }} />
        </div>
      </div>

      <p className="mt-2.5 text-xs text-[color:var(--text-soft)]">
        {lastReportLabel}: {formatTime(station.aggregates.lastVotedAt)}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <a
          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[rgba(255,255,255,0.72)] px-3 py-2 text-xs font-semibold text-[color:var(--text-muted)] transition hover:border-[color:var(--petrol)] hover:bg-[rgba(19,84,79,0.08)] hover:text-[color:var(--petrol)]"
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
        >
          {openMapsLabel}
        </a>
        <Link className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[var(--petrol)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--petrol-deep)]" href={`/station/${station._id}`}>
          বিস্তারিত দেখুন
        </Link>
      </div>

      <div className="mt-3 border-t border-[color:var(--border)] pt-3">
        <p className="mb-2 text-[11px] font-semibold text-[color:var(--text-soft)]">এই স্টেশনে এখন তেল আছে কি না জানান</p>
        <VoteButtons stationId={station._id.toString()} compact />
      </div>
    </article>
  );
}
