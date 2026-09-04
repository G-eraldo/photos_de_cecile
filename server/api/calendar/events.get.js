import { enforceRateLimit } from "../../utils/request-security.js";

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, { scope: "calendar-availability", limit: 90, windowMs: 15 * 60 * 1000 });
  const config = useRuntimeConfig(event);

  if (!config.googleCalendarApiKey || !config.googleCalendarId) {
    throw createError({
      statusCode: 503,
      statusMessage: "Le calendrier n'est pas encore configuré.",
    });
  }

  const query = getQuery(event);
  const from = typeof query.from === "string" ? new Date(query.from) : new Date();
  const to = typeof query.to === "string"
    ? new Date(query.to)
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
    throw createError({ statusCode: 400, statusMessage: "Période de recherche invalide." });
  }

  const calendarUrl = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.googleCalendarId)}/events`,
  );
  calendarUrl.search = new URLSearchParams({
    key: config.googleCalendarApiKey,
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  }).toString();

  try {
    const response = await $fetch(calendarUrl.toString());

    const availability = (response.items || [])
      .filter((item) => item.summary
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes("seance photo"))
      .map((item) => ({
        start: item.start?.dateTime || item.start?.date,
        end: item.end?.dateTime || item.end?.date,
      }));

    const reservations = (response.items || [])
      .filter((item) => !item.summary
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes("seance photo"))
      .map((item) => ({
        start: item.start?.dateTime || item.start?.date,
        end: item.end?.dateTime || item.end?.date,
      }));

    return { availability, reservations };
  } catch (error) {
    console.error("Impossible de récupérer les disponibilités Google Calendar.", error?.statusCode || error);
    throw createError({
      statusCode: 502,
      statusMessage: "Les disponibilités sont momentanément indisponibles.",
    });
  }
});
