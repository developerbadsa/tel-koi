import { Schema, model, models, type Model } from "mongoose";

export interface SubmissionRateDoc {
  voterKeyHash: string;
  dayKey: string;
  dailyCount: number;
  lastSubmittedAt: Date;
}

const submissionRateSchema = new Schema<SubmissionRateDoc>(
  {
    voterKeyHash: { type: String, required: true, unique: true },
    dayKey: { type: String, required: true },
    dailyCount: { type: Number, required: true, default: 0 },
    lastSubmittedAt: { type: Date, required: true },
  },
  { timestamps: false },
);

export const SubmissionRate =
  (models.SubmissionRate as Model<SubmissionRateDoc>) || model<SubmissionRateDoc>("SubmissionRate", submissionRateSchema);
