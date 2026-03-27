import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { getVoterKeyHash } from "@/lib/hash";
import { refreshAggregates } from "@/lib/mosque";
import { voteSchema } from "@/lib/validation";
import { Mosque } from "@/models/Mosque";
import { Vote } from "@/models/Vote";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const parse = voteSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });

  const mosque = await Mosque.findById(id).lean();
  if (!mosque || mosque.status !== "ACTIVE") return NextResponse.json({ error: "Station not found" }, { status: 404 });

  const voterKeyHash = await getVoterKeyHash();
  const hasVotedBefore = await Vote.exists({ voterKeyHash, mosqueId: id });
  if (hasVotedBefore) {
    return NextResponse.json({ error: "তুমি এই স্টেশনে আগেই ভোট দিছো। এক স্টেশনে একজন ইউজার ১ বার ভোট দিতে পারবে।" }, { status: 409 });
  }

  await Vote.create({ mosqueId: id, voteType: parse.data.voteType, voterKeyHash });
  const aggregates = await refreshAggregates(id);

  return NextResponse.json({ ok: true, aggregates });
}
