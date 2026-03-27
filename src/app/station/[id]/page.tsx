import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VoteButtons } from "@/components/VoteButtons";
import { connectDb } from "@/lib/db";
import { env } from "@/lib/env";
import { formatTime } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { Station } from "@/models/Station";
import { Vote } from "@/models/Vote";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    await connectDb("read");
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
  } catch (error) {
    console.error("[StationMetadata] Failed to load station metadata.", error);
    return {
      title: `Station - ${siteConfig.name}`,
      description: "Station details are temporarily unavailable.",
      alternates: { canonical: `${env.NEXT_PUBLIC_APP_URL}/station/${id}` },
    };
  }
}

export default async function StationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await connectDb("read");
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
        <div className="rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.78)] p-4 shadow-soft">
          <h1 className="text-2xl font-semibold text-[color:var(--petrol-deep)]">{station.name}</h1>
          <p className="mt-1 text-[color:var(--text-muted)]">
            {station.area} · {station.address || "ঠিকানা দেওয়া হয়নি"}
          </p>
          <a
            className="mt-3 inline-flex rounded-lg border border-[rgba(191,116,24,0.18)] bg-[rgba(244,182,61,0.14)] px-3 py-2 text-sm font-semibold text-[color:var(--fuel-deep)] hover:bg-[rgba(244,182,61,0.22)]"
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
          >
            গুগল ম্যাপে খুলুন
          </a>
        </div>

        {station.proofImage?.dataUrl && (
          <section className="rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.78)] p-4 shadow-soft">
            <h2 className="mb-2 font-semibold text-[color:var(--petrol-deep)]">লোকেশন প্রুফ ছবি</h2>
            <img src={station.proofImage.dataUrl} alt={`${station.name} proof`} className="h-auto w-full rounded-2xl object-cover" />
            <p className="mt-2 text-xs text-[color:var(--text-soft)]">স্টেশন যোগ করার সময় দেওয়া optional proof image।</p>
          </section>
        )}

        <div className="rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.78)] p-4 shadow-soft">
          <p className="text-[color:var(--text-muted)]">তেল আছে: {station.aggregates.yesCount} | তেল নেই: {station.aggregates.noCount}</p>
          <p className="text-[color:var(--text-muted)]">বিশ্বাসের মান: {(station.aggregates.confidenceScore * 100).toFixed(1)}%</p>
          <p className="text-[color:var(--text-muted)]">সর্বশেষ রিপোর্ট: {formatTime(station.aggregates.lastVotedAt)}</p>
        </div>

        <VoteButtons stationId={id} />

        <section className="rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.78)] p-4 shadow-soft">
          <h2 className="mb-2 font-semibold text-[color:var(--petrol-deep)]">সর্বশেষ ২০টি রিপোর্ট</h2>
          <ul className="space-y-1 text-sm text-[color:var(--text-muted)]">
            {votes.length > 0 ? (
              votes.map((vote) => (
                <li key={vote._id.toString()}>
                  {vote.voteType === "YES" ? "তেল আছে" : "তেল নেই"} · {formatTime(vote.createdAt)}
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
  } catch (error) {
    console.error("[StationDetailPage] Failed to load station details.", error);
    return (
      <div className="rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4 text-sm text-[color:var(--danger-text)]">
        স্টেশনের তথ্য এখন সাময়িকভাবে পাওয়া যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।
      </div>
    );
  }
}
