import { Schema, model, models, type Model, type Types } from "mongoose";

export interface VoteDoc {
  stationId: Types.ObjectId;
  voteType: "YES" | "NO";
  voterKeyHash: string;
  createdAt: Date;
}

const voteSchema = new Schema<VoteDoc>(
  {
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    voteType: { type: String, enum: ["YES", "NO"], required: true },
    voterKeyHash: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

voteSchema.index({ stationId: 1, voterKeyHash: 1, createdAt: -1 });
voteSchema.index({ voterKeyHash: 1, createdAt: -1 });

export const Vote = (models.Vote as Model<VoteDoc>) || model<VoteDoc>("Vote", voteSchema);
