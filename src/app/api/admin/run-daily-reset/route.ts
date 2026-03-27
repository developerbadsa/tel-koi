import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { env } from "@/lib/env";
import { ChangeLog } from "@/models/ChangeLog";
import { Mosque } from "@/models/Mosque";
import { Vote } from "@/models/Vote";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!env.ADMIN_TOKEN || auth !== env.ADMIN_TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDb();
  const voteResult = await Vote.deleteMany({});
  const mosqueResult = await Mosque.updateMany(
    {},
    { $set: { "aggregates.yesCount": 0, "aggregates.noCount": 0, "aggregates.lastVotedAt": null, "aggregates.confidenceScore": 0.5 } },
  );

  await ChangeLog.create({
    type: "DAILY_RESET",
    ranAt: new Date(),
    clearedVotesCount: voteResult.deletedCount ?? 0,
    affectedMosquesCount: mosqueResult.modifiedCount,
  });

  return NextResponse.json({
    ok: true,
    dhakaScheduledAt: "21:00 Asia/Dhaka",
    clearedVotesCount: voteResult.deletedCount ?? 0,
    affectedMosquesCount: mosqueResult.modifiedCount,
  });
}
