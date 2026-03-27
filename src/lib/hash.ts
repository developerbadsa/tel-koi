import crypto from "crypto";
import { headers } from "next/headers";
import { env } from "@/lib/env";

export async function getVoterKeyHash() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for") ?? "unknown";
  const ip = forwarded.split(",")[0]?.trim() ?? "unknown";
  const ua = h.get("user-agent") ?? "unknown";
  return crypto
    .createHash("sha256")
    .update(`${ip}|${ua}|${env.VOTER_HASH_SALT}`)
    .digest("hex");
}
