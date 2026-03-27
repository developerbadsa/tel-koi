import mongoose from "mongoose";
import { env } from "@/lib/env";

declare global {
  var mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const globalCache = global.mongooseConn ?? { conn: null, promise: null };
global.mongooseConn = globalCache;

export async function connectDb() {
  if (globalCache.conn) return globalCache.conn;
  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(env.MONGODB_URI, { dbName: "biranikothaylal" });
  }
  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
