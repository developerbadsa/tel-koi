import type { MetadataRoute } from "next";
import { connectDb } from "@/lib/db";
import { Mosque } from "@/models/Mosque";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDb();
  const mosques = await Mosque.find({ status: "ACTIVE" }, { _id: 1, updatedAt: 1 }).lean();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/about", "/add"].map((path) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}${path}`,
    lastModified: new Date(),
  }));

  const mosqueRoutes = mosques.map((m) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}/station/${m._id.toString()}`,
    lastModified: m.updatedAt,
  }));

  return [...staticRoutes, ...mosqueRoutes];
}
