import { Vote } from "@/models/Vote";
import { Mosque } from "@/models/Mosque";

export async function refreshAggregates(mosqueId: string) {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const [yesCount, noCount, lastVote] = await Promise.all([
    Vote.countDocuments({ mosqueId, voteType: "YES" }),
    Vote.countDocuments({ mosqueId, voteType: "NO" }),
    Vote.findOne({ mosqueId }).sort({ createdAt: -1 }).lean(),
  ]);

  const [recentYes, recentNo] = await Promise.all([
    Vote.countDocuments({ mosqueId, voteType: "YES", createdAt: { $gte: sixHoursAgo } }),
    Vote.countDocuments({ mosqueId, voteType: "NO", createdAt: { $gte: sixHoursAgo } }),
  ]);
  const totalRecent = recentYes + recentNo;
  const confidenceScore = totalRecent === 0 ? 0.5 : recentYes / totalRecent;

  const isVerified = yesCount + noCount >= 20;

  await Mosque.findByIdAndUpdate(mosqueId, {
    $set: {
      isVerified,
      "aggregates.yesCount": yesCount,
      "aggregates.noCount": noCount,
      "aggregates.lastVotedAt": lastVote?.createdAt ?? null,
      "aggregates.confidenceScore": Number(confidenceScore.toFixed(3)),
    },
  });

  return { yesCount, noCount, confidenceScore, lastVotedAt: lastVote?.createdAt ?? null };
}
