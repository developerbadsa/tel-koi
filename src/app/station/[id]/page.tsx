import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VoteButtons } from "@/components/VoteButtons";
import { formatTime } from "@/lib/format";
import { env } from "@/lib/env";
import { connectDb } from "@/lib/db";
import { siteConfig } from "@/lib/site";
import { Station } from "@/models/Station";
import { Vote } from "@/models/Vote";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  await connectDb();
  const { id } = await params;
  const station = await Station.findById(id).lean();
  if (!station) return { title: "স্টেশন পাওয়া যায়নি" };

  const title = `${station.name} - ${siteConfig.name}`;
  const description = `${station.area} এলাকার কমিউনিটি রিপোর্ট`;
  return {
    title,
    description,
    alternates: { canonical: `${env.NEXT_PUBLIC_APP_URL}/station/${id}` },
    openGraph: { title, description, siteName: siteConfig.name },
  };
}

export default async function StationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  const { id } = await params;
  const station = await Station.findById(id).lean();
  if (!station) notFound();

  const votes = await Vote.find({ stationId: id }).sort({ createdAt: -1 }).limit(20).lean();
  const [lng, lat] = station.location.coordinates;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: station.name,
    address: station.address,
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
    url: `${env.NEXT_PUBLIC_APP_URL}/station/${id}`,
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-soft">
        <h1 className="text-2xl font-semibold text-zinc-900">{station.name}</h1>
        <p className="mt-1 text-zinc-600">
          {station.area} · {station.address || "ঠিকানা দেওয়া হয়নি"}
        </p>
        <a className="mt-3 inline-flex rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100" href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer">
          গুগল ম্যাপে খুলুন
        </a>
      </div>

      <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-soft">
        <p>তেল আছে: {station.aggregates.yesCount} | তেল নেই: {station.aggregates.noCount}</p>
        <p>বিশ্বাসের মান: {(station.aggregates.confidenceScore * 100).toFixed(1)}%</p>
        <p>সর্বশেষ রিপোর্ট: {formatTime(station.aggregates.lastVotedAt)}</p>
      </div>

      <VoteButtons stationId={id} />

      <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-soft">
        <h2 className="mb-2 font-semibold text-zinc-900">সর্বশেষ ২০টি রিপোর্ট</h2>
        <ul className="space-y-1 text-sm text-zinc-600">
          {votes.length > 0 ? (
            votes.map((v) => (
              <li key={v._id.toString()}>
                {v.voteType === "YES" ? "তেল আছে" : "তেল নেই"} · {formatTime(v.createdAt)}
              </li>
            ))
          ) : (
            <li>এখনও কোনো রিপোর্ট আসেনি।</li>
          )}
        </ul>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
