import { Schema, model, models } from "mongoose";

const changeLogSchema = new Schema(
  {
    type: { type: String, enum: ["DAILY_RESET"], required: true },
    ranAt: { type: Date, required: true },
    clearedVotesCount: { type: Number, required: true },
    affectedMosquesCount: { type: Number, required: true },
  },
  { timestamps: true },
);

export const ChangeLog = models.ChangeLog || model("ChangeLog", changeLogSchema);
