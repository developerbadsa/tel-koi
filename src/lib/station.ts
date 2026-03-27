import { Vote } from "@/models/Vote";
import { Station } from "@/models/Station";

export async function refreshStationAggregates(stationId: string) {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const [yesCount, noCount, lastVote, recentYesCount, recentNoCount] = await Promise.all([
    Vote.countDocuments({ stationId, voteType: "YES" }),
    Vote.countDocuments({ stationId, voteType: "NO" }),
    Vote.findOne({ stationId }).sort({ createdAt: -1 }).lean(),
    Vote.countDocuments({ stationId, voteType: "YES", createdAt: { $gte: sixHoursAgo } }),
    Vote.countDocuments({ stationId, voteType: "NO", createdAt: { $gte: sixHoursAgo } }),
  ]);

  const total = yesCount + noCount;
  const confidenceScore = total === 0 ? 0.5 : yesCount / total;

  await Station.findByIdAndUpdate(stationId, {
    $set: {
      "aggregates.yesCount": yesCount,
      "aggregates.noCount": noCount,
      "aggregates.lastVotedAt": lastVote?.createdAt ?? null,
      "aggregates.confidenceScore": confidenceScore,
      "aggregates.recentYesCount": recentYesCount,
      "aggregates.recentNoCount": recentNoCount,
    },
  });

  return { yesCount, noCount, confidenceScore, lastVotedAt: lastVote?.createdAt ?? null };
}
