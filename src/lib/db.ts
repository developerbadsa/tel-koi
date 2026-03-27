import mongoose from "mongoose";
import { env } from "@/lib/env";

mongoose.set("bufferCommands", false);

const RETRY_DELAYS_MS = [0, 500, 1500];

declare global {
  var mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
  var mongooseConnListenersBound: boolean | undefined;
}

const globalCache = global.mongooseConn ?? { conn: null, promise: null };
global.mongooseConn = globalCache;

export class DatabaseConnectionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DatabaseConnectionError";
  }
}

function resetCache() {
  globalCache.conn = null;
  globalCache.promise = null;
}

function toDatabaseConnectionError(error: unknown) {
  if (error instanceof DatabaseConnectionError) return error;

  const cause = error instanceof Error ? error : undefined;
  const message = cause?.message?.includes("tlsv1 alert internal error")
    ? "MongoDB TLS handshake failed while selecting a server."
    : "Failed to connect to MongoDB.";

  return new DatabaseConnectionError(message, { cause });
}

function bindConnectionListeners() {
  if (global.mongooseConnListenersBound) return;
  global.mongooseConnListenersBound = true;

  mongoose.connection.on("disconnected", () => {
    resetCache();
  });

  mongoose.connection.on("error", () => {
    globalCache.conn = null;
  });
}

async function wait(delayMs: number) {
  if (delayMs === 0) return;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function createConnectionPromise() {
  let lastError: unknown;

  for (const [index, delayMs] of RETRY_DELAYS_MS.entries()) {
    await wait(delayMs);

    try {
      return await mongoose.connect(env.MONGODB_URI, {
        dbName: env.MONGODB_DB_NAME,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      });
    } catch (error) {
      lastError = error;
      globalCache.conn = null;
      console.error(`[db] MongoDB connection attempt ${index + 1}/${RETRY_DELAYS_MS.length} failed.`, error);

      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect().catch(() => undefined);
      }
    }
  }

  throw toDatabaseConnectionError(lastError);
}

export async function connectDb() {
  bindConnectionListeners();

  if (globalCache.conn && mongoose.connection.readyState === 1) return globalCache.conn;

  if (!globalCache.promise) {
    globalCache.promise = createConnectionPromise();
  }

  try {
    globalCache.conn = await globalCache.promise;
    return globalCache.conn;
  } catch (error) {
    resetCache();
    throw toDatabaseConnectionError(error);
  }
}

export function isDatabaseConnectionError(error: unknown): error is DatabaseConnectionError {
  return error instanceof DatabaseConnectionError;
}
