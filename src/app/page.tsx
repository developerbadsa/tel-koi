import { HomeTabs } from "@/components/HomeTabs";
import { connectDb } from "@/lib/db";
import { getDict } from "@/lib/lang";
import { siteConfig } from "@/lib/site";
import { Station } from "@/models/Station";
import { Vote } from "@/models/Vote";
import type { StationItem, TrendingRow } from "@/types/station";

export const revalidate = 30;

export default async function HomePage() {
  const { t } = await getDict();
  let dbUnavailable = false;
  let stations: StationItem[] = [];
  let trending: { topYes: TrendingRow[]; topNo: TrendingRow[]; mostActive: TrendingRow[] } = {
    topYes: [],
    topNo: [],
    mostActive: [],
  };
  let totalVotesLast24Hours = 0;

  try {
    await connectDb("read");

    const stationDocs = await Station.find({ status: "ACTIVE" })
      .sort({ "aggregates.lastVotedAt": -1, createdAt: -1 })
      .limit(100)
      .lean();

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const rows = (await Vote.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: "$stationId",
          yes: { $sum: { $cond: [{ $eq: ["$voteType", "YES"] }, 1, 0] } },
          no: { $sum: { $cond: [{ $eq: ["$voteType", "NO"] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $lookup: { from: "stations", localField: "_id", foreignField: "_id", as: "station" } },
      { $unwind: "$station" },
    ])) as Array<TrendingRow & { yes: number; no: number }>;

    stations = JSON.parse(JSON.stringify(stationDocs)) as StationItem[];
    trending = JSON.parse(
      JSON.stringify({
        topYes: [...rows].sort((a, b) => b.yes - a.yes).slice(0, 5),
        topNo: [...rows].sort((a, b) => b.no - a.no).slice(0, 5),
        mostActive: [...rows].sort((a, b) => b.total - a.total).slice(0, 5),
      }),
    ) as typeof trending;
    totalVotesLast24Hours = rows.reduce((sum, row) => sum + (row.total ?? 0), 0);
  } catch (error) {
    dbUnavailable = true;
    console.error("[HomePage] Failed to load live station data.", error);
  }

  const stats = [
    { label: "চালু লোকেশন", value: stations.length.toString() },
    { label: "গত ২৪ ঘণ্টার ভোট", value: totalVotesLast24Hours.toString() },
    { label: "কভার হওয়া এলাকা", value: new Set(stations.map((station) => station.area)).size.toString() },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: siteConfig.name,
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <section className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(11,59,55,0.96),rgba(19,84,79,0.9)_54%,rgba(244,182,61,0.74))] p-4 text-white shadow-soft md:rounded-3xl md:p-7">
        {dbUnavailable && (
          <div className="mb-4 rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-3 py-2 text-sm text-[color:var(--danger-text)]">
            লাইভ স্টেশন ডেটা এখন সাময়িকভাবে পাওয়া যাচ্ছে না। MongoDB reconnect হলেই তথ্য আবার দেখাবে।
          </div>
        )}
        <p className="mb-2 inline-flex rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.12)] px-3 py-1 text-xs font-semibold tracking-wide text-[color:var(--fuel-soft)]">
          কমিউনিটি লাইভ আপডেট
        </p>
        <h1 className="text-2xl font-extrabold leading-tight md:text-4xl">আজ কোথায় পেট্রোল, ডিজেল আর অকটেন পাওয়া যাচ্ছে</h1>
        <p className="mt-2 max-w-3xl text-sm text-[rgba(255,255,255,0.84)] md:mt-3 md:text-base">
          {siteConfig.district} জেলার পাম্পগুলোর রিপোর্ট, ভোট, আর ম্যাপ ভিউ এক জায়গায়। কাছের স্টেশন খুঁজে নিন, তারপর নিজের তথ্যও যোগ করুন।
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5 md:mt-5 md:grid-cols-3 md:gap-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl border border-[rgba(255,255,255,0.16)] bg-[rgba(247,251,250,0.14)] p-3 backdrop-blur md:rounded-2xl md:p-4">
              <p className="text-xs text-[rgba(255,255,255,0.72)]">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-[color:var(--fuel-soft)] md:text-2xl">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.78)] p-3 shadow-soft md:rounded-3xl md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[color:var(--petrol-deep)]">লাইভ স্টেশন আপডেট</h2>
            <p className="text-sm text-[color:var(--text-muted)]">প্রতি স্টেশনের ভোট অবস্থা, তেল থাকার সম্ভাবনা আর সাম্প্রতিক রিপোর্ট এখানে দেখা যাবে।</p>
          </div>
        </div>
        <HomeTabs stations={stations} trending={trending} t={t} />
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
