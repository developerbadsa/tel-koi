import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { env } from "@/lib/env";
import { getVoterKeyHash } from "@/lib/hash";
import { siteConfig } from "@/lib/site";
import { createStationSchema, queryStationSchema } from "@/lib/validation";
import { Station } from "@/models/Station";
import { SubmissionRate } from "@/models/SubmissionRate";

export async function GET(req: NextRequest) {
  await connectDb();
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
      .sort({ "aggregates.lastVotedAt": -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Station.countDocuments(filter),
  ]);

  const res = NextResponse.json({ items, total, page, limit });
  res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return res;
}

export async function POST(req: NextRequest) {
  await connectDb();
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

  const { name, area, address, lat, lng } = parse.data;
  const created = await Station.create({
    name,
    district: siteConfig.district,
    area,
    address,
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
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
