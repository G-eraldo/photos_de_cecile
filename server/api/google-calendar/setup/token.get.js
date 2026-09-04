import { consumeGoogleRefreshToken, requireGoogleSetupSession } from "../../../utils/google-oauth-setup.js";

export default defineEventHandler((event) => {
  requireGoogleSetupSession(event);
  setResponseHeader(event, "Cache-Control", "no-store");
  return { refreshToken: consumeGoogleRefreshToken(event) };
});
