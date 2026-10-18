import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "google_calendar_setup_session";
const STATE_COOKIE = "google_calendar_setup_state";
const TOKEN_COOKIE = "google_calendar_setup_token";
const COOKIE_MAX_AGE = 10 * 60;
const SESSION_TOKEN_PATTERN = /^([A-Za-z0-9_-]{43})\.([0-9]{13})\.([A-Za-z0-9_-]{43})$/;

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/api/google-calendar/setup",
  maxAge: COOKIE_MAX_AGE,
});

const setupSecret = () => {
  const secret = process.env.GOOGLE_OAUTH_SETUP_SECRET;
  if (!secret) {
    throw createError({
      statusCode: 503,
      statusMessage:
        "La configuration temporaire de Google Agenda est indisponible.",
    });
  }
  return secret;
};

const sessionSigningSecret = () => {
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: "La configuration OAuth Google est incomplète.",
    });
  }
  // The signed cookie must not reveal an offline check for the setup password.
  return createHmac("sha256", clientSecret)
    .update(setupSecret())
    .digest("base64url");
};

const secretsMatch = (first, second) => {
  if (typeof first !== "string" || typeof second !== "string") return false;
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return (
    firstBuffer.length === secondBuffer.length &&
    timingSafeEqual(firstBuffer, secondBuffer)
  );
};

export const createGoogleSetupSessionToken = (secret, now = Date.now()) => {
  const payload = `${randomBytes(32).toString("base64url")}.${now + COOKIE_MAX_AGE * 1000}`;
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

export const verifyGoogleSetupSessionToken = (token, secret, now = Date.now()) => {
  if (typeof token !== "string" || typeof secret !== "string" || !secret) return false;
  const match = SESSION_TOKEN_PATTERN.exec(token);
  if (!match) return false;
  const expiresAt = Number(match[2]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;
  const payload = `${match[1]}.${match[2]}`;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  return timingSafeEqual(Buffer.from(match[3]), Buffer.from(expected));
};

export const assertGoogleSetupEnabled = () => {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    throw createError({ statusCode: 404, statusMessage: "Page introuvable." });
  }
};

export const requireGoogleSetupSession = (event) => {
  const session = getCookie(event, SESSION_COOKIE);
  if (!verifyGoogleSetupSessionToken(session, sessionSigningSecret())) {
    throw createError({
      statusCode: 401,
      statusMessage: "Accès non autorisé.",
    });
  }
};

export const createGoogleSetupSession = (event, secret) => {
  if (!secretsMatch(secret, setupSecret())) {
    throw createError({ statusCode: 401, statusMessage: "Secret invalide." });
  }
  setCookie(
    event,
    SESSION_COOKIE,
    createGoogleSetupSessionToken(sessionSigningSecret()),
    cookieOptions(),
  );
};

export const createGoogleSetupState = (event) => {
  const state = randomBytes(32).toString("base64url");
  setCookie(event, STATE_COOKIE, state, cookieOptions());
  return state;
};

export const consumeGoogleSetupState = (event, state) => {
  const expectedState = getCookie(event, STATE_COOKIE);
  deleteCookie(event, STATE_COOKIE, { path: "/api/google-calendar/setup" });
  if (!secretsMatch(state, expectedState)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Autorisation Google invalide ou expirée.",
    });
  }
};

export const storeGoogleRefreshToken = (event, refreshToken) => {
  setCookie(event, TOKEN_COOKIE, refreshToken, cookieOptions());
};

export const consumeGoogleRefreshToken = (event) => {
  const refreshToken = getCookie(event, TOKEN_COOKIE);
  deleteCookie(event, TOKEN_COOKIE, { path: "/api/google-calendar/setup" });
  if (!refreshToken) {
    throw createError({
      statusCode: 404,
      statusMessage: "Aucun token temporaire à afficher.",
    });
  }
  return refreshToken;
};
