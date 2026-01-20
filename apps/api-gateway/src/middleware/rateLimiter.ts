// apps/api-gateway/src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from "express";
import redis from "../config/redis";

const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  // Use IP address as the unique key for the user
  const ip = req.ip || req.socket.remoteAddress || "unknown-ip"; 
  const key = `rate_limit:${ip}`;
  
  const LIMIT = 20;   // Max 20 requests
  const WINDOW = 60;  // Per 60 seconds

  try {
    // Increment the counter for this IP
    const requests = await redis.incr(key);

    // If this is the first request, set the expiry time
    if (requests === 1) {
      await redis.expire(key, WINDOW);
    }

    // Check if limit exceeded
    if (requests > LIMIT) {
      // Return explicitly to stop execution
      res.status(429).json({ 
        error: "Too many requests. Please slow down.",
        retryAfter: WINDOW 
      });
      return; 
    }

    next(); // Pass control to the next middleware/controller
  } catch (err) {
    console.error("Redis Rate Limiter Error:", err);
    // Fail Open: If Redis is down, allow the request to proceed so the app doesn't crash
    next(); 
  }
};

export default rateLimiter;