import { createPrivateUpload, createPrivateUploadUrl } from "../../../utils/r2-private.js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const upload = createPrivateUpload(body || {});
  return createPrivateUploadUrl(upload);
});
