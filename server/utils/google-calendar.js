export const isAvailabilityEvent = (event) => event.summary
  ?.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .includes("seance photo");

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
