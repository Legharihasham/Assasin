import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
  }
  return new Redis({ url, token });
}

let ratelimitInstance: Ratelimit | null = null;

export function getRateLimiter(): Ratelimit {
  if (!ratelimitInstance) {
    ratelimitInstance = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "uol-assignment-generator",
    });
  }
  return ratelimitInstance;
}
