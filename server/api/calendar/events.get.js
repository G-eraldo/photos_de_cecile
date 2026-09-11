import {
  getGoogleAccessToken,
  listCalendarEvents,
} from "../../utils/google-calendar.js";
import {
  getMollieConfig,
  listActiveReservationHolds,
} from "../../utils/mollie.js";
import { enforceRateLimit } from "../../utils/request-security.js";
import { buildAvailabilitySlots } from "../../utils/reservation-slots.js";

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, {
    scope: "calendar-availability",
    limit: 90,
    windowMs: 15 * 60 * 1000,
  });
  const config = useRuntimeConfig(event);

  if (!config.googleCalendarId) {
    throw createError({
      statusCode: 503,
      statusMessage: "Le calendrier n'est pas encore configuré.",
    });
  }

  const query = getQuery(event);
  const now = new Date();
  const maximumDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const requestedFrom =
    typeof query.from === "string" ? new Date(query.from) : now;
  const requestedTo =
    typeof query.to === "string" ? new Date(query.to) : maximumDate;
  const from = requestedFrom < now ? now : requestedFrom;
  const to = requestedTo > maximumDate ? maximumDate : requestedTo;

  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime()) ||
    from >= to
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Période de recherche invalide.",
    });
  }

  try {
    const accessToken = await getGoogleAccessToken(config);
    const events = await listCalendarEvents(config, from, to, accessToken);
    let holds = [];
    try {
      holds = await listActiveReservationHolds(getMollieConfig());
    } catch {
      holds = [];
    }

    return {
      availability: buildAvailabilitySlots({ events, now, holds }),
    };
  } catch (error) {
    console.error(
      "Impossible de récupérer les disponibilités Google Calendar.",
      error?.statusCode || error,
    );
    throw createError({
      statusCode: 502,
      statusMessage: "Les disponibilités sont momentanément indisponibles.",
    });
  }
});
