// apps/ai-service/src/config/redis.ts
import Redis from "ioredis";

const redis = new Redis({
  host: "redis", // Matches service name in docker-compose
  port: 6379,
});

redis.on("connect", () => console.log("✅ [AI-Service] Connected to Redis"));
redis.on("error", (err) => console.error("❌ [AI-Service] Redis Error:", err));

export default redis;