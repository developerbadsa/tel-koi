import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { trendingSchema } from "@/lib/validation";
import { Vote } from "@/models/Vote";

export async function GET(req: NextRequest) {
  await connectDb();
  const parse = trendingSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });

  const since = new Date(Date.now() - parse.data.hours * 60 * 60 * 1000);
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
    {
      $lookup: {
        from: "mosques",
        localField: "_id",
        foreignField: "_id",
        as: "mosque",
      },
    },
    { $unwind: "$mosque" },
  ]);

  const byYes = [...rows].sort((a, b) => b.yes - a.yes).slice(0, 5);
  const byNo = [...rows].sort((a, b) => b.no - a.no).slice(0, 5);
  const byActive = [...rows].sort((a, b) => b.total - a.total).slice(0, 5);

  const res = NextResponse.json({ topYes: byYes, topNo: byNo, mostActive: byActive });
  res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return res;
}
