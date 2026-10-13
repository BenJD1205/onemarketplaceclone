import { createClient } from 'redis';
import {env} from "./env.js";

export const redis = createClient({
  password: env.redis.password,
  database: env.redis.database,
  socket: {
    host: env.redis.host,
    port: env.redis.port,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error("Retry limit reached");
      }
      return Math.min(100 * 2 ** retries, 3000);
    },
  }
});

redis.on("error", (error) => {
    console.error("Redis error:", error);
})

export const connectRedis = async () => {
  if(!redis.isOpen) {
    await redis.connect();
  }

  await redis.ping();
  console.log(`Redis connected at ${env.redis.host}:${env.redis.port}`);
};

export const disconnectRedis = async () => {
    if(redis.isOpen) {
        await redis.quit();
    }
}