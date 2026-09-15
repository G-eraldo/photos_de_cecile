import {
  isThemedSession,
  SESSION_TYPES,
} from "../../shared/utils/reservation-duration.js";

const normalizeSummary = (value) =>
  String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .trim()
  .toLowerCase()
;

export const isAvailabilityEvent = (event) =>
  normalizeSummary(event?.summary).includes("seance photo");

export const getAvailabilitySessionType = (event) => {
  if (isThemedSession(event?.summary)) return SESSION_TYPES.THEMED;
  return isAvailabilityEvent(event) ? SESSION_TYPES.STANDARD : null;
};

export const isReservationAvailabilityEvent = (event) =>
  getAvailabilitySessionType(event) !== null;

export const getGoogleAccessToken = async (config) => {
  if (!config.googleClientId || !config.googleClientSecret || !config.googleRefreshToken) {
    throw createError({
      statusCode: 503,
      statusMessage: "L'autorisation d'écriture Google Calendar n'est pas terminée.",
    });
  }

  const token = await $fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      refresh_token: config.googleRefreshToken,
      grant_type: "refresh_token",
    }),
  });

  return token.access_token;
};

export const calendarEventsUrl = (calendarId) =>
  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;

export const reservationCalendarId = (reference) => {
  if (!/^r[a-f0-9]{32}$/.test(reference || "")) throw createError({ statusCode: 400, statusMessage: "Référence de réservation invalide." });
  // Google event IDs accept base32hex characters; use the UUID's hexadecimal part.
  return `cecile${reference.slice(1)}`;
};

export const listCalendarEvents = async (config, start, end, accessToken) => {
  const items = [];
  let pageToken;
  do {
    const url = new URL(calendarEventsUrl(config.googleCalendarId));
    url.search = new URLSearchParams({
      timeMin: start.toISOString(),
      singleEvents: "true",
      maxResults: "2500",
      ...(end ? { timeMax: end.toISOString() } : {}),
      ...(pageToken ? { pageToken } : {}),
    }).toString();
    const response = await $fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
    items.push(...(response.items || []));
    pageToken = response.nextPageToken;
  } while (pageToken);
  return items;
};

export const assertCalendarAvailability = async (config, start, end, reference, sessionType = SESSION_TYPES.STANDARD) => {
  const accessToken = await getGoogleAccessToken(config);
  const ownId = reference ? reservationCalendarId(reference) : null;
  const events = await listCalendarEvents(config, start, end, accessToken);
  const ownEvent = ownId && events.find((item) => item.id === ownId && item.status !== "cancelled");
  if (ownEvent) return { accessToken, existingEvent: ownEvent };
  const available = events.some((item) => getAvailabilitySessionType(item) === sessionType && new Date(item.start?.dateTime || item.start?.date) <= start && new Date(item.end?.dateTime || item.end?.date) >= end);
  const occupied = events.some((item) => item.status !== "cancelled" && !isReservationAvailabilityEvent(item) && start < new Date(item.end?.dateTime || item.end?.date) && end > new Date(item.start?.dateTime || item.start?.date));
  if (!available || occupied) throw createError({ statusCode: 409, statusMessage: "Ce créneau n’est plus disponible. Merci d’en choisir un autre." });
  return { accessToken, existingEvent: null };
};

export const ensureGoogleCalendarWriterAccess = async (config) => {
  const accessToken = await getGoogleAccessToken(config);
  // Le scope OAuth demandé par le parcours /connexion-agenda est
  // `calendar.events`. Il donne accès aux événements, mais pas aux
  // métadonnées du calendrier (`calendars.get`). Interroger les événements
  // valide donc correctement le token sans requérir une autorisation plus
  // large ni créer un événement de test.
  const url = new URL(calendarEventsUrl(config.googleCalendarId));
  url.search = new URLSearchParams({ maxResults: "1" }).toString();
  await $fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};
