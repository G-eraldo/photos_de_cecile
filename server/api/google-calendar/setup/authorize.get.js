import { createGoogleSetupState, requireGoogleSetupSession } from "../../../utils/google-oauth-setup.js";

export default defineEventHandler((event) => {
  requireGoogleSetupSession(event);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw createError({ statusCode: 503, statusMessage: "GOOGLE_CLIENT_ID ou GOOGLE_REDIRECT_URI est absent." });
  }

  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
    state: createGoogleSetupState(event),
  }).toString();

  return { authorizationUrl: authorizationUrl.toString() };
});
