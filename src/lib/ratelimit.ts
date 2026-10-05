import crypto from "crypto";
import { redis } from "./redis";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 5;

function getAnonymousIdentifier(ip: string) {
  const date = new Date().toISOString().slice(0, 10);

  return crypto
    .createHmac(
      "sha256",
      process.env.RATE_LIMIT_SECRET || "default_rate_limit_secret"
    )
    .update(`${date}:${ip}`)
    .digest("hex");
}

export async function checkRateLimit(ip: string, action: string = "send-message") {
  try {
    const identifier = getAnonymousIdentifier(ip);

    const key = `rate:${action}:${identifier}`;

    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    return {
      allowed: count <= MAX_REQUESTS,
      remaining: Math.max(0, MAX_REQUESTS - count),
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail-open to avoid breaking functionality if Redis fails
    return {
      allowed: true,
      remaining: 1,
    };
  }
}