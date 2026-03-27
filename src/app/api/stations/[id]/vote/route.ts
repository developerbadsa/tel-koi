import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { getVoterKeyHash } from "@/lib/hash";
import { refreshStationAggregates } from "@/lib/station";
import { voteSchema } from "@/lib/validation";
import { Station } from "@/models/Station";
import { Vote } from "@/models/Vote";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const parse = voteSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });

  const station = await Station.findById(id).lean();
  if (!station || station.status !== "ACTIVE") return NextResponse.json({ error: "Station not found" }, { status: 404 });

  const voterKeyHash = await getVoterKeyHash();
  const hasVotedBefore = await Vote.exists({ voterKeyHash, stationId: id });
  if (hasVotedBefore) {
    return NextResponse.json({ error: "আপনি এই স্টেশনে আগেই ভোট দিয়েছেন। একজন ব্যবহারকারী এক স্টেশনে একবারই ভোট দিতে পারবেন।" }, { status: 409 });
  }

  await Vote.create({ stationId: id, voteType: parse.data.voteType, voterKeyHash });
  const aggregates = await refreshStationAggregates(id);

  return NextResponse.json({ ok: true, aggregates });
}
