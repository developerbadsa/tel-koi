import { Schema, model, models, type Model } from "mongoose";

export interface MosqueDoc {
  name: string;
  district: "Lalmonirhat";
  area: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  isVerified: boolean;
  status: "ACTIVE" | "INACTIVE";
  aggregates: {
    yesCount: number;
    noCount: number;
    lastVotedAt: Date | null;
    confidenceScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const mosqueSchema = new Schema<MosqueDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    district: { type: String, required: true, enum: ["Lalmonirhat"], default: "Lalmonirhat" },
    area: { type: String, required: true },
    address: { type: String, default: "" },
    location: {
      type: { type: String, enum: ["Point"], required: true, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    aggregates: {
      yesCount: { type: Number, default: 0 },
      noCount: { type: Number, default: 0 },
      lastVotedAt: { type: Date, default: null },
      confidenceScore: { type: Number, default: 0.5 },
    },
  },
  { timestamps: true },
);

mosqueSchema.index({ location: "2dsphere" });
mosqueSchema.index({ area: 1, status: 1 });

export const Mosque = (models.Mosque as Model<MosqueDoc>) || model<MosqueDoc>("Mosque", mosqueSchema);
