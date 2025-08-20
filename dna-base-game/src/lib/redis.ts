import { createClient } from "redis";

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) },
});

client.on("error", (err) => console.error("❌ Redis error:", err));

// Reuse the same connection across hot-reloads in dev
const globalForRedis = global as unknown as { redis?: ReturnType<typeof createClient> };
if (!globalForRedis.redis) {
  globalForRedis.redis = client;
  client.connect().then(() => console.log("✅ Redis connected")).catch(console.error);
}
export const redis = globalForRedis.redis!;