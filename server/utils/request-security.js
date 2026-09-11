import { createHash } from "node:crypto";
import { isIP } from "node:net";

const buckets = new Map();
const maximumBuckets = 10000;
const incrementScript =
  'local n = redis.call("INCR", KEYS[1]); if n == 1 then redis.call("PEXPIRE", KEYS[1], ARGV[1]) end; return {n, redis.call("PTTL", KEYS[1])}';

export function requestClientIp(event) {
  // Only configure a header that the ingress proxy overwrites on every request.
  const header = process.env.TRUSTED_CLIENT_IP_HEADER;
  const forwarded = header ? getRequestHeader(event, header.toLowerCase()) : "";
  if (forwarded && isIP(forwarded.trim())) return forwarded.trim();
  return getRequestIP(event, { xForwardedFor: false }) || "unknown";
}

export async function enforceRateLimit(
  event,
  { scope, limit, windowMs, global: shared = false },
) {
  const identity = shared ? "global" : requestClientIp(event);
  const key = `cecile:limit:${scope}:${createHash("sha256").update(identity).digest("hex")}`;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  let count;
  let remainingMs;
  if (redisUrl && redisToken) {
    try {
      const response = await fetch(redisUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          "EVAL",
          incrementScript,
          "1",
          key,
          String(windowMs),
        ]),
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) throw new Error("rate_limit_unavailable");
      const payload = await response.json();
      if (payload.error || !Array.isArray(payload.result))
        throw new Error("rate_limit_invalid");
      [count, remainingMs] = payload.result.map(Number);
      if (
        !Number.isFinite(count) ||
        !Number.isFinite(remainingMs) ||
        remainingMs < 0
      )
        throw new Error("rate_limit_invalid");
    } catch {
      throw createError({
        statusCode: 503,
        statusMessage:
          "Le service est momentanément indisponible. Veuillez réessayer.",
      });
    }
  } else {
    if (process.env.NODE_ENV === "production") {
      throw createError({
        statusCode: 503,
        statusMessage: "La protection du service doit être configurée.",
      });
    }
    const now = Date.now();
    for (const [oldKey, entry] of buckets)
      if (entry.resetAt <= now) buckets.delete(oldKey);
    if (!buckets.has(key)) {
      if (buckets.size >= maximumBuckets)
        throw createError({
          statusCode: 503,
          statusMessage: "Veuillez réessayer dans quelques instants.",
        });
      buckets.set(key, { count: 0, resetAt: now + windowMs });
    }
    const entry = buckets.get(key);
    count = ++entry.count;
    remainingMs = entry.resetAt - now;
  }
  if (count > limit) {
    setResponseHeader(
      event,
      "Retry-After",
      String(Math.max(1, Math.ceil(remainingMs / 1000))),
    );
    throw createError({
      statusCode: 429,
      statusMessage:
        "Trop de demandes. Veuillez réessayer dans quelques instants.",
    });
  }
}

export function enforceTrustedOrigin(event) {
  const origin = getRequestHeader(event, "origin");
  const method = getMethod(event);
  if (!origin) {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      throw createError({
        statusCode: 403,
        statusMessage: "Origine de requête non autorisée.",
      });
    }
    return;
  }
  const allowedOrigins = [
    process.env.SITE_URL,
    ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
  ].filter(Boolean);
  if (
    !allowedOrigins.some(
      (allowed) => origin === String(allowed).replace(/\/$/, ""),
    )
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Origine de requête non autorisée.",
    });
  }
}
