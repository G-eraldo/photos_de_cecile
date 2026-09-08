import fs from "node:fs/promises";
import vm from "node:vm";
import assert from "node:assert/strict";
const root = "/Users/geraldo/Developer/les_photos_de_cecile/photos_de_cecile";
let source = await fs.readFile(root + "/server/api/contact.post.js", "utf8");
source = source
  .replace(/import[\s\S]*?from "resend";/, "")
  .replace(/import[\s\S]*?from "\.\.\/utils\/request-security.js";/, "")
  .replace("export default", "globalThis.handler =");
const ctx = {
  Resend: class {
    emails = {
      send: async () => ({
        data: null,
        error: { message: "simulated provider rejection" },
      }),
    };
  },
  enforceRateLimit() {},
  enforceTrustedOrigin() {},
  defineEventHandler: (x) => x,
  readBody: async () => ({
    nom: "Test",
    prenom: "Audit",
    email: "audit@example.org",
    message: "Simulation locale uniquement",
  }),
  process: { env: { RESEND_API_KEY: "fake" } },
  createError: (x) => x,
};
vm.createContext(ctx);
vm.runInContext(source, ctx);
const result = await ctx.handler({});
assert.equal(result.success, true);
console.log(
  "CONFIRMED: contact returns success after simulated Resend rejection",
);
for (const key of [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_PRIVATE_BUCKET",
  "ORDER_UPLOAD_SIGNING_SECRET",
])
  process.env[key] = "audit-fake";
globalThis.createError = (x) => Object.assign(new Error(x.statusMessage), x);
const r2 = await import(root + "/server/utils/r2-private.js");
const upload = r2.createPrivateUpload({
  filename: "test.jpg",
  type: "image/jpeg",
  size: 123,
});
const signed = r2.createPrivateUploadUrl(
  upload,
  new Date(Date.now() - 16 * 60 * 1000),
);
assert.throws(() => r2.verifyPrivateUploadToken(signed.uploadToken), /expiré/);
console.log("CONFIRMED: existing cart photo token rejected after 16 minutes");
const url = new URL(signed.uploadUrl);
assert.equal(url.searchParams.get("X-Amz-SignedHeaders"), "content-type;host");
console.log(
  "CONFIRMED: signed upload does not bind content-length or content hash",
);
