import { z } from "zod";
import { areas } from "@/i18n/dict";

export const queryMosqueSchema = z.object({
  query: z.string().optional().default(""),
  area: z.string().optional().default(""),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const createMosqueSchema = z.object({
  name: z.string().trim().min(2).max(120),
  area: z.enum(areas),
  address: z.string().trim().max(200).optional().default(""),
  lat: z.number().min(25).max(27),
  lng: z.number().min(88).max(90),
  notes: z.string().trim().max(400).optional().default(""),
});

export const voteSchema = z.object({
  voteType: z.enum(["YES", "NO"]),
});

export const trendingSchema = z.object({
  hours: z.coerce.number().int().min(1).max(48).default(24),
});
