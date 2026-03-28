import mongoose from "mongoose";
import { Vote } from "@/models/Vote";
import { Station } from "@/models/Station";

export async function refreshStationAggregates(stationId: string) {
  const [summary] = await Vote.aggregate<{
    yesCount: number;
    noCount: number;
    lastVotedAt: Date | null;
  }>([
    { $match: { stationId: new mongoose.Types.ObjectId(stationId) } },
    {
      $group: {
        _id: "$stationId",
        yesCount: { $sum: { $cond: [{ $eq: ["$voteType", "YES"] }, 1, 0] } },
        noCount: { $sum: { $cond: [{ $eq: ["$voteType", "NO"] }, 1, 0] } },
        lastVotedAt: { $max: "$createdAt" },
      },
    },
  ]);

  const yesCount = summary?.yesCount ?? 0;
  const noCount = summary?.noCount ?? 0;
  const total = yesCount + noCount;
  const confidenceScore = total === 0 ? 0.5 : yesCount / total;

  await Station.findByIdAndUpdate(stationId, {
    $set: {
      "aggregates.yesCount": yesCount,
      "aggregates.noCount": noCount,
      "aggregates.lastVotedAt": summary?.lastVotedAt ?? null,
      "aggregates.confidenceScore": confidenceScore,
    },
  });

  return { yesCount, noCount, confidenceScore, lastVotedAt: summary?.lastVotedAt ?? null };
}
