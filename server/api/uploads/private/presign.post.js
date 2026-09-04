import { createPrivateUpload, createPrivateUploadUrl } from "../../../utils/r2-private.js";
import { enforceRateLimit, enforceTrustedOrigin } from "../../../utils/request-security.js";

export default defineEventHandler(async (event) => {
  enforceTrustedOrigin(event);
  enforceRateLimit(event, { scope: "private-upload", limit: 12, windowMs: 10 * 60 * 1000 });
  const body = await readBody(event);
  const upload = createPrivateUpload(body || {});
  return createPrivateUploadUrl(upload);
});
