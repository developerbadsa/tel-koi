import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VoteButtons } from "@/components/VoteButtons";
import { formatTime } from "@/lib/format";
import { env } from "@/lib/env";
import { connectDb } from "@/lib/db";
import { Mosque } from "@/models/Mosque";
import { Vote } from "@/models/Vote";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  await connectDb();
  const { id } = await params;
  const mosque = await Mosque.findById(id).lean();
  if (!mosque) return { title: "খুঁজে পাওয়া যায় নাই" };

  const title = `${mosque.name} - PetrolKoiLal (Lalmonirhat)`;
  const description = `${mosque.area} এলাকার কমিউনিটি রিপোর্ট`;
  return {
    title,
    description,
    alternates: { canonical: `${env.NEXT_PUBLIC_APP_URL}/station/${id}` },
    openGraph: { title, description, siteName: "PetrolKoiLal" },
  };
}

export default async function MosqueDetail({ params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  const { id } = await params;
  const mosque = await Mosque.findById(id).lean();
  if (!mosque) notFound();

  const votes = await Vote.find({ mosqueId: id }).sort({ createdAt: -1 }).limit(20).lean();
  const [lng, lat] = mosque.location.coordinates;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: mosque.name,
    address: mosque.address,
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
    url: `${env.NEXT_PUBLIC_APP_URL}/station/${id}`,
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900">{mosque.name}</h1>
      <p className="text-zinc-600">
        {mosque.area} · {mosque.address || "-"}
      </p>
      <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-soft">
        <p>তেল আছে: {mosque.aggregates.yesCount} | তেল নাই: {mosque.aggregates.noCount}</p>
        <p>ভরসার মান: {(mosque.aggregates.confidenceScore * 100).toFixed(1)}%</p>
        <p>শেষ খবর: {formatTime(mosque.aggregates.lastVotedAt)}</p>
      </div>
      <VoteButtons mosqueId={id} />
      <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-soft">
        <h2 className="mb-2 font-semibold text-zinc-900">শেষ ২০টা রিপোর্ট</h2>
        <ul className="space-y-1 text-sm text-zinc-600">
          {votes.map((v) => (
            <li key={v._id.toString()}>
              {v.voteType === "YES" ? "তেল আছে" : "তেল নাই"} · {formatTime(v.createdAt)}
            </li>
          ))}
        </ul>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
