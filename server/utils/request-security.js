const buckets = new Map();

const clientKey = (event, scope) => `${scope}:${getRequestIP(event, { xForwardedFor: true }) || "unknown"}`;

export function enforceRateLimit(event, { scope, limit, windowMs }) {
  const key = clientKey(event, scope);
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count += 1;
  if (entry.count > limit) {
    setResponseHeader(event, "Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
    throw createError({ statusCode: 429, statusMessage: "Trop de demandes. Veuillez réessayer dans quelques instants." });
  }
}

export function enforceTrustedOrigin(event) {
  const origin = getRequestHeader(event, "origin");
  if (!origin) return;

  const allowedOrigins = [process.env.SITE_URL, "http://localhost:3000"].filter(Boolean);
  if (!allowedOrigins.some((allowedOrigin) => origin === String(allowedOrigin).replace(/\/$/, ""))) {
    throw createError({ statusCode: 403, statusMessage: "Origine de requête non autorisée." });
  }
}
