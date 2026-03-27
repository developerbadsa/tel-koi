import type { MetadataRoute } from "next";
import { connectDb } from "@/lib/db";
import { Station } from "@/models/Station";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDb();
  const stations = await Station.find({ status: "ACTIVE" }, { _id: 1, updatedAt: 1 }).lean();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/about", "/add"].map((path) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}${path}`,
    lastModified: new Date(),
  }));

  const stationRoutes = stations.map((station) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}/station/${station._id.toString()}`,
    lastModified: station.updatedAt,
  }));

  return [...staticRoutes, ...stationRoutes];
}
