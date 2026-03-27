import { HomeTabs } from "@/components/HomeTabs";
import { connectDb } from "@/lib/db";
import { getDict } from "@/lib/lang";
import { Mosque } from "@/models/Mosque";
import { Vote } from "@/models/Vote";

export const revalidate = 30;

export default async function HomePage() {
  await connectDb();
  const { t } = await getDict();
  const mosques = await Mosque.find({ status: "ACTIVE" }).sort({ "aggregates.lastVotedAt": -1, createdAt: -1 }).limit(100).lean();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await Vote.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: "$mosqueId",
        yes: { $sum: { $cond: [{ $eq: ["$voteType", "YES"] }, 1, 0] } },
        no: { $sum: { $cond: [{ $eq: ["$voteType", "NO"] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
    { $lookup: { from: "mosques", localField: "_id", foreignField: "_id", as: "mosque" } },
    { $unwind: "$mosque" },
  ]);

  const trending = {
    topYes: [...rows].sort((a, b) => b.yes - a.yes).slice(0, 5),
    topNo: [...rows].sort((a, b) => b.no - a.no).slice(0, 5),
    mostActive: [...rows].sort((a, b) => b.total - a.total).slice(0, 5),
  };
  const totalVotesLast24Hours = rows.reduce((sum, row) => sum + (row.total ?? 0), 0);

  const stats = [
    { label: "মোট চালু লোকেশন", value: mosques.length.toString() },
    { label: "গত ২৪ ঘণ্টার ভোট", value: totalVotesLast24Hours.toString() },
    { label: "পাওয়া জায় এমন এলাকা", value: new Set(mosques.map((m) => m.area)).size.toString() },
  ];

  const jsonLd = { "@context": "https://schema.org", "@type": "WebPage", name: "PetrolKoiLal", url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" };

  return (
    <div className="space-y-4 md:space-y-6">
      <section className="overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-stone-100 via-orange-50 to-amber-50 p-4 text-zinc-900 shadow-lg md:rounded-3xl md:p-7 md:shadow-xl">
        <p className="mb-2 inline-flex rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold tracking-wide text-orange-700">কমিউনিটি লাইভ খবর</p>
        <h1 className="text-2xl font-extrabold leading-tight md:text-4xl">আজ কোথায় পেট্রোল/ডিজেল পাওয়া যাচ্ছে</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-700 md:mt-3 md:text-base">
          নিচে সব স্টেশনের রিপোর্ট দেখো, ভোট দাও, আর ম্যাপে গিয়ে কাছের পাম্প মিলিয়ে নাও।
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5 md:mt-5 md:grid-cols-3 md:gap-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl border border-orange-200/80 bg-white/85 p-3 backdrop-blur md:rounded-2xl md:p-4">
              <p className="text-xs text-zinc-600">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-orange-800 md:text-2xl">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-orange-100 bg-white p-3 shadow-md md:rounded-3xl md:p-6 md:shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">লাইভ স্টেশন আপডেট</h2>
            <p className="text-sm text-zinc-600">প্রতি স্টেশনের ভোট অবস্থা, তেল থাকার সম্ভাবনা আর আপডেট - সব একজায়গায়।</p>
          </div>
        </div>
        <HomeTabs mosques={JSON.parse(JSON.stringify(mosques))} trending={JSON.parse(JSON.stringify(trending))} t={t} />
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
