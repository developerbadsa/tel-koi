import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { withRouteErrorHandling } from "@/lib/route-handler";
import { Station } from "@/models/Station";
import { Vote } from "@/models/Vote";

export const GET = withRouteErrorHandling("api.stations.id.get", async (_: Request, { params }: { params: Promise<{ id: string }> }) => {
  await connectDb();
  const { id } = await params;
  const item = await Station.findById(id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const votes = await Vote.find({ stationId: id }).sort({ createdAt: -1 }).limit(20).lean();
  const res = NextResponse.json({ item, votes: votes.map((v) => ({ voteType: v.voteType, createdAt: v.createdAt })) });
  res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return res;
});
