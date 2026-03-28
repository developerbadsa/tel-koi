import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { env } from "@/lib/env";
import { getVoterKeyHash } from "@/lib/hash";
import { withRouteErrorHandling } from "@/lib/route-handler";
import { siteConfig } from "@/lib/site";
import { createStationSchema, queryStationSchema } from "@/lib/validation";
import { Station } from "@/models/Station";
import { SubmissionRate } from "@/models/SubmissionRate";

export const GET = withRouteErrorHandling("api.stations.get", async (req: NextRequest) => {
  await connectDb("read");
  const parse = queryStationSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });

  const { query, area, page, limit } = parse.data;
  const filter: Record<string, unknown> = { status: "ACTIVE" };
  if (area) filter.area = area;
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: "i" } },
      { address: { $regex: query, $options: "i" } },
      { area: { $regex: query, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Station.find(filter)
      .select({
        name: 1,
        area: 1,
        address: 1,
        location: 1,
        aggregates: 1,
        createdAt: 1,
      })
      .sort({ "aggregates.lastVotedAt": -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Station.countDocuments(filter),
  ]);

  const res = NextResponse.json({ items, total, page, limit });
  res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return res;
});

export const POST = withRouteErrorHandling("api.stations.post", async (req: NextRequest) => {
  await connectDb("write");
  const body = await req.json();
  const parse = createStationSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  const voterKeyHash = await getVoterKeyHash();
  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const limit = env.DAILY_STATION_ADD_LIMIT;

  const tracker = await SubmissionRate.findOne({ voterKeyHash }).lean();
  if (tracker && tracker.dayKey === dayKey && tracker.dailyCount >= limit) {
    return NextResponse.json({ error: `আজকের limit শেষ। দিনে সর্বোচ্চ ${limit}টি স্টেশন add করা যাবে।` }, { status: 429 });
  }

  const { name, area, address, lat, lng, proofImage } = parse.data;
  const created = await Station.create({
    name,
    district: siteConfig.district,
    area,
    address,
    proofImage: proofImage
      ? {
          ...proofImage,
          uploadedAt: now,
        }
      : undefined,
    status: "ACTIVE",
    isVerified: false,
    location: { type: "Point", coordinates: [lng, lat] },
  });

  if (!tracker) {
    await SubmissionRate.create({ voterKeyHash, dayKey, dailyCount: 1, lastSubmittedAt: now });
  } else if (tracker.dayKey === dayKey) {
    await SubmissionRate.updateOne({ voterKeyHash }, { $set: { lastSubmittedAt: now }, $inc: { dailyCount: 1 } });
  } else {
    await SubmissionRate.updateOne({ voterKeyHash }, { $set: { dayKey, dailyCount: 1, lastSubmittedAt: now } });
  }

  return NextResponse.json({ item: created }, { status: 201 });
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
