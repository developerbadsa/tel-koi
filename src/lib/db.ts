import dns from "node:dns/promises";
import mongoose from "mongoose";
import { env } from "@/lib/env";

mongoose.set("bufferCommands", false);

const RETRY_DELAYS_MS = [0, 500, 1500];
const DIRECT_FALLBACK_TIMEOUT_MS = 5000;

type ConnectionMode = "read" | "write";
type CachedConnection = { conn: typeof mongoose; mode: ConnectionMode };

declare global {
  var mongooseConn:
    | {
        conn: typeof mongoose | null;
        promise: Promise<CachedConnection> | null;
        mode: ConnectionMode | null;
      }
    | undefined;
  var mongooseConnListenersBound: boolean | undefined;
}

const globalCache = global.mongooseConn ?? { conn: null, promise: null, mode: null };
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
  globalCache.mode = null;
}

function isTlsSelectionError(error: unknown) {
  return error instanceof Error && error.message.includes("tlsv1 alert internal error");
}

function toDatabaseConnectionError(error: unknown) {
  if (error instanceof DatabaseConnectionError) return error;

  const cause = error instanceof Error ? error : undefined;
  const message = isTlsSelectionError(cause)
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

async function disconnectCurrentConnection() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => undefined);
  }
  resetCache();
}

async function connectPrimary() {
  let lastError: unknown;

  for (const [index, delayMs] of RETRY_DELAYS_MS.entries()) {
    await wait(delayMs);

    try {
      await mongoose.connect(env.MONGODB_URI, {
        dbName: env.MONGODB_DB_NAME,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      });
      return { conn: mongoose, mode: "write" as const };
    } catch (error) {
      lastError = error;
      globalCache.conn = null;
      console.error(`[db] MongoDB primary connection attempt ${index + 1}/${RETRY_DELAYS_MS.length} failed.`, error);
      await disconnectCurrentConnection();
    }
  }

  throw toDatabaseConnectionError(lastError);
}

function buildDirectFallbackUri(host: string, txtRecord: string) {
  const parsed = new URL(env.MONGODB_URI.replace("mongodb+srv://", "http://"));
  const query = new URLSearchParams(txtRecord);
  query.set("directConnection", "true");
  query.set("readPreference", "secondaryPreferred");
  query.set("tls", "true");
  if (!query.has("authSource")) query.set("authSource", "admin");

  const username = encodeURIComponent(decodeURIComponent(parsed.username));
  const password = encodeURIComponent(decodeURIComponent(parsed.password));
  return `mongodb://${username}:${password}@${host}:27017/?${query.toString()}`;
}

async function connectReadFallback() {
  const parsed = new URL(env.MONGODB_URI.replace("mongodb+srv://", "http://"));
  const clusterHost = parsed.hostname;
  const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${clusterHost}`);
  const txtRecords = await dns.resolveTxt(clusterHost).catch(() => []);
  const txtRecord = txtRecords.flat().join("&");

  let lastError: unknown;

  for (const record of srvRecords) {
    const uri = buildDirectFallbackUri(record.name, txtRecord);

    try {
      await mongoose.connect(uri, {
        dbName: env.MONGODB_DB_NAME,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: DIRECT_FALLBACK_TIMEOUT_MS,
      });
      console.warn(`[db] Using direct secondary fallback for read traffic via ${record.name}.`);
      return { conn: mongoose, mode: "read" as const };
    } catch (error) {
      lastError = error;
      console.error(`[db] Direct read fallback via ${record.name} failed.`, error);
      await disconnectCurrentConnection();
    }
  }

  throw toDatabaseConnectionError(lastError);
}

async function createConnectionPromise(requestedMode: ConnectionMode) {
  try {
    return await connectPrimary();
  } catch (error) {
    if (requestedMode === "read" && isTlsSelectionError(error)) {
      return connectReadFallback();
    }
    throw error;
  }
}

export async function connectDb(mode: ConnectionMode = "write") {
  bindConnectionListeners();

  const currentMode = globalCache.mode;
  const canReuseExistingConnection =
    globalCache.conn &&
    mongoose.connection.readyState === 1 &&
    (currentMode === "write" || currentMode === mode);

  if (canReuseExistingConnection) return globalCache.conn;

  if (mode === "write" && currentMode === "read") {
    await disconnectCurrentConnection();
  }

  if (!globalCache.promise) {
    globalCache.promise = createConnectionPromise(mode);
  }

  try {
    const result = await globalCache.promise;
    globalCache.conn = result.conn;
    globalCache.mode = result.mode;
    return globalCache.conn;
  } catch (error) {
    resetCache();
    throw toDatabaseConnectionError(error);
  }
}

export function isDatabaseConnectionError(error: unknown): error is DatabaseConnectionError {
  return error instanceof DatabaseConnectionError;
}
