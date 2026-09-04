import { createGoogleSetupSession } from "../../../utils/google-oauth-setup.js";
import { enforceRateLimit, enforceTrustedOrigin } from "../../../utils/request-security.js";

export default defineEventHandler(async (event) => {
  enforceTrustedOrigin(event);
  enforceRateLimit(event, { scope: "google-calendar-setup", limit: 5, windowMs: 15 * 60 * 1000 });

  const body = await readBody(event);
  createGoogleSetupSession(event, body?.secret);
  return { success: true };
});
