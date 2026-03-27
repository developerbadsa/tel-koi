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
    <article className="group rounded-2xl border border-orange-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-4">
      <div className="flex items-start justify-between gap-2.5">
        <div>
          <p className="mb-1.5 inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">কমিউনিটি যাচাই</p>
          <Link className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 hover:text-orange-700 hover:underline" href={`/station/${station._id}`}>
            {station.name}
          </Link>
          <p className="mt-0.5 text-sm font-medium text-zinc-600">{station.area}</p>
          <p className="line-clamp-1 text-xs text-zinc-500">{station.address || "ঠিকানা পাওয়া যায়নি"}</p>
        </div>
        <span className="shrink-0 rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-700">{totalVotes} ভোট</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-orange-800">
          <p className="text-xs font-semibold tracking-wide">{yesLabel}</p>
          <p className="mt-0.5 text-lg font-extrabold">{station.aggregates.yesCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-700">
          <p className="text-xs font-semibold tracking-wide">{noLabel}</p>
          <p className="mt-0.5 text-lg font-extrabold">{station.aggregates.noCount}</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
          <p>বিশ্বাসের মান</p>
          <p className="font-semibold text-zinc-700">{confidence}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${confidence}%` }} />
        </div>
      </div>

      <p className="mt-2.5 text-xs text-zinc-500">
        {lastReportLabel}: {formatTime(station.aggregates.lastVotedAt)}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <a
          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
        >
          {openMapsLabel}
        </a>
        <Link className="inline-flex min-h-9 items-center justify-center rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-700" href={`/station/${station._id}`}>
          বিস্তারিত দেখুন
        </Link>
      </div>

      <div className="mt-3 border-t border-zinc-100 pt-3">
        <p className="mb-2 text-[11px] font-semibold text-zinc-500">এই স্টেশনে এখন তেল আছে কি না জানান</p>
        <VoteButtons stationId={station._id.toString()} compact />
      </div>
    </article>
  );
}
