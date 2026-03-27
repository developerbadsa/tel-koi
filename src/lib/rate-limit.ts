import { Vote } from "@/models/Vote";

export async function checkVoteRateLimit(voterKeyHash: string, mosqueId: string) {
  const now = new Date();
  const sixtyMinAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoMinAgo = new Date(now.getTime() - 2 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [lastMosqueVote, burstCount, dailyCount] = await Promise.all([
    Vote.findOne({ voterKeyHash, mosqueId }).sort({ createdAt: -1 }).lean(),
    Vote.countDocuments({ voterKeyHash, createdAt: { $gte: twoMinAgo } }),
    Vote.countDocuments({ voterKeyHash, createdAt: { $gte: dayAgo } }),
  ]);

  if (lastMosqueVote && lastMosqueVote.createdAt > sixtyMinAgo) {
    return { ok: false, nextAllowedAt: new Date(lastMosqueVote.createdAt.getTime() + 60 * 60 * 1000) };
  }
  if (burstCount >= 5) {
    return { ok: false, nextAllowedAt: new Date(now.getTime() + 2 * 60 * 1000) };
  }
  if (dailyCount >= 30) {
    return { ok: false, nextAllowedAt: new Date(now.getTime() + 24 * 60 * 60 * 1000) };
  }

  return { ok: true as const };
}
