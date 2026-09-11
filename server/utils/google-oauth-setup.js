import { randomBytes, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "google_calendar_setup_session";
const STATE_COOKIE = "google_calendar_setup_state";
const TOKEN_COOKIE = "google_calendar_setup_token";
const COOKIE_MAX_AGE = 10 * 60;

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

const secretsMatch = (first, second) => {
  if (typeof first !== "string" || typeof second !== "string") return false;
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return (
    firstBuffer.length === secondBuffer.length &&
    timingSafeEqual(firstBuffer, secondBuffer)
  );
};

export const assertGoogleSetupEnabled = () => {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    throw createError({ statusCode: 404, statusMessage: "Page introuvable." });
  }
};

export const requireGoogleSetupSession = (event) => {
  const session = getCookie(event, SESSION_COOKIE);
  if (!session || !/^[A-Za-z0-9_-]{43}$/.test(session)) {
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
    randomBytes(32).toString("base64url"),
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
