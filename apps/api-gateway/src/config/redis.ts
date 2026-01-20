// apps/api-gateway/src/config/redis.ts
import Redis from "ioredis";

// Connect to the 'redis' service defined in docker-compose
const redis = new Redis({
  host: "redis", // Docker service name
  port: 6379,
});

redis.on("connect", () => console.log("✅ [Redis] Connected to Redis"));
redis.on("error", (err) => console.error("❌ [Redis] Connection Error:", err));

export default redis;