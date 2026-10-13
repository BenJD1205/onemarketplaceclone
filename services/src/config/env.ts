import "dotenv/config";

const parsePort = (value: string | undefined): number => {
  const port = Number(value ?? 4000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("PORT must be a valid integer between 0 and 65535");
  }
  return port;
};

const parseRedisDatabase = (value: string | undefined): number => {
  const database = Number(value ?? 0);
  if (!Number.isInteger(database) || database < 0) {
    throw new Error("REDIS_DATABASE must be a valid non-negative integer");
  }
  return database;
}

export const env = {
    port: parsePort(process.env.PORT),
    clerkSecretKey: process.env.CLERK_SECRET_KEY ?? "",
    nodeEnv: process.env.NODE_ENV ?? "development", 
    redis: {
      password: process.env.REDIS_PASSWORD ?? "onemarketplace",
      host: process.env.REDIS_HOST ?? "127.0.0.1",
      database: parseRedisDatabase(process.env.REDIS_DATABASE),
      port: Number(process.env.REDIS_PORT ?? 6379)
    }
};