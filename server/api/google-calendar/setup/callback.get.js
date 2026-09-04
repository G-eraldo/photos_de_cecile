import {
  consumeGoogleSetupState,
  requireGoogleSetupSession,
  storeGoogleRefreshToken,
} from "../../../utils/google-oauth-setup.js";

export default defineEventHandler(async (event) => {
  const redirectToSetup = (error) => sendRedirect(event, `/connexion-agenda?error=${encodeURIComponent(error)}`);
  const query = getQuery(event);
  if (query.error || typeof query.code !== "string" || typeof query.state !== "string") {
    return redirectToSetup("L’autorisation Google a été annulée ou a expiré.");
  }

  try {
    requireGoogleSetupSession(event);
    consumeGoogleSetupState(event, query.state);

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) {
      throw createError({ statusCode: 503, statusMessage: "Les identifiants OAuth Google sont incomplets." });
    }

    const token = await $fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: query.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!token?.refresh_token) {
      return redirectToSetup("Google n’a pas renvoyé de refresh token. Révoque l’accès de l’application, puis recommence.");
    }

    storeGoogleRefreshToken(event, token.refresh_token);
    return sendRedirect(event, "/connexion-agenda?connected=1");
  } catch (error) {
    console.error("Impossible de terminer l’autorisation Google Agenda.", error?.statusCode || error);
    return redirectToSetup("Impossible de terminer l’autorisation. Vérifie l’URL de redirection dans Google Cloud.");
  }
});
