import { enforceRateLimit } from "../../utils/request-security.js";
import { RESERVATION_DURATION_MS } from "~~/shared/utils/reservation-duration.js";

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
  const now = new Date();
  const maximumDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const requestedFrom = typeof query.from === "string" ? new Date(query.from) : now;
  const requestedTo = typeof query.to === "string" ? new Date(query.to) : maximumDate;
  const from = requestedFrom < now ? now : requestedFrom;
  const to = requestedTo > maximumDate ? maximumDate : requestedTo;

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

    const isPhotoSession = (item) => item.summary
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes("seance photo");
    const getInterval = (item) => ({
      start: new Date(item.start?.dateTime || item.start?.date),
      end: new Date(item.end?.dateTime || item.end?.date),
    });
    const blockedIntervals = (response.items || [])
      .filter((item) => !isPhotoSession(item))
      .map(getInterval)
      .filter((item) => !Number.isNaN(item.start.getTime()) && !Number.isNaN(item.end.getTime()));

    // Le client ne reçoit jamais les rendez-vous personnels : seulement les créneaux
    // d'une heure encore effectivement réservables.
    const availability = (response.items || [])
      .filter(isPhotoSession)
      .flatMap((item) => {
        const interval = getInterval(item);
        if (Number.isNaN(interval.start.getTime()) || Number.isNaN(interval.end.getTime())) return [];

        const slots = [];
        for (
          const start = new Date(Math.max(interval.start.getTime(), now.getTime()));
          start.getTime() + RESERVATION_DURATION_MS <= interval.end.getTime();
          start.setTime(start.getTime() + RESERVATION_DURATION_MS)
        ) {
          const end = new Date(start.getTime() + RESERVATION_DURATION_MS);
          const blocked = blockedIntervals.some((other) => start < other.end && end > other.start);
          if (!blocked) slots.push({ start: start.toISOString(), end: end.toISOString() });
        }
        return slots;
      });

    return { availability };
  } catch (error) {
    console.error("Impossible de récupérer les disponibilités Google Calendar.", error?.statusCode || error);
    throw createError({
      statusCode: 502,
      statusMessage: "Les disponibilités sont momentanément indisponibles.",
    });
  }
});
