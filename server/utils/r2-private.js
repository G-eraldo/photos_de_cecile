import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const algorithm = "AWS4-HMAC-SHA256";
const service = "s3";
const region = "auto";
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const hmac = (key, value) => createHmac("sha256", key).update(value).digest();
const encode = (value) => encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
const timestamp = (date) => date.toISOString().replace(/[:-]|\.\d{3}/g, "");

const config = () => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_PRIVATE_BUCKET;
  const uploadSigningSecret = process.env.ORDER_UPLOAD_SIGNING_SECRET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !uploadSigningSecret) {
    throw createError({ statusCode: 503, statusMessage: "Le téléversement privé n’est pas encore configuré." });
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, uploadSigningSecret, host: `${accountId}.r2.cloudflarestorage.com` };
};

const signingKey = (secretAccessKey, dateStamp) => {
  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, service);
  return hmac(serviceKey, "aws4_request");
};

const pathFor = ({ bucket }, key) => `/${encode(bucket)}/${key.split("/").map(encode).join("/")}`;
const canonicalHeaders = (headers) => Object.entries(headers).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => `${name}:${String(value).trim()}\n`).join("");
const signedHeaders = (headers) => Object.keys(headers).sort().join(";");

export const validateOrderImage = ({ filename, type, size }) => {
  if (typeof filename !== "string" || !filename.trim() || !allowedImageTypes.has(type) || !Number.isFinite(Number(size)) || Number(size) <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Ajoutez une photo JPG, PNG, WebP ou HEIC valide." });
  }
};

export const createPrivateUpload = ({ filename, type, size }) => {
  validateOrderImage({ filename, type, size });
  const extension = filename.trim().split(".").pop().replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "image";
  return { key: `commandes/pending/${randomUUID()}.${extension.toLowerCase()}`, filename: filename.trim().slice(0, 180), type, size: Number(size) };
};

const encodeToken = (payload, secret) => {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
};

export const verifyPrivateUploadToken = (token) => {
  if (typeof token !== "string") throw createError({ statusCode: 400, statusMessage: "Référence de photo invalide." });
  const [body, signature] = token.split(".");
  const r2 = config();
  if (!body || !signature) throw createError({ statusCode: 400, statusMessage: "Référence de photo invalide." });
  const expected = createHmac("sha256", r2.uploadSigningSecret).update(body).digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw createError({ statusCode: 400, statusMessage: "Référence de photo invalide." });
  }
  try {
    const upload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    validateOrderImage(upload);
    if (typeof upload.expiresAt !== "number" || upload.expiresAt < Date.now()) throw new Error("expired");
    return upload;
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Le lien de téléversement a expiré. Veuillez choisir votre photo à nouveau." });
  }
};

export const createPrivateUploadUrl = (upload, now = new Date()) => {
  const r2 = config();
  const amzDate = timestamp(now);
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const headers = { "content-type": upload.type, host: r2.host };
  const parameters = [
    ["X-Amz-Algorithm", algorithm],
    ["X-Amz-Credential", `${r2.accessKeyId}/${credentialScope}`],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", "900"],
    ["X-Amz-SignedHeaders", signedHeaders(headers)],
  ];
  const canonicalQuery = parameters.sort(([first], [second]) => first.localeCompare(second)).map(([name, value]) => `${encode(name)}=${encode(value)}`).join("&");
  const canonicalRequest = ["PUT", pathFor(r2, upload.key), canonicalQuery, canonicalHeaders(headers), signedHeaders(headers), "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = [algorithm, amzDate, credentialScope, sha256(canonicalRequest)].join("\n");
  const signature = createHmac("sha256", signingKey(r2.secretAccessKey, dateStamp)).update(stringToSign).digest("hex");
  const expiresAt = now.getTime() + 15 * 60 * 1000;
  return { uploadUrl: `https://${r2.host}${pathFor(r2, upload.key)}?${canonicalQuery}&X-Amz-Signature=${signature}`, uploadToken: encodeToken({ ...upload, expiresAt }, r2.uploadSigningSecret) };
};

const signedR2Request = async (method, key) => {
  const r2 = config();
  const now = new Date();
  const amzDate = timestamp(now);
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const headers = { host: r2.host, "x-amz-content-sha256": sha256(""), "x-amz-date": amzDate };
  const canonicalRequest = [method, pathFor(r2, key), "", canonicalHeaders(headers), signedHeaders(headers), headers["x-amz-content-sha256"]].join("\n");
  const stringToSign = [algorithm, amzDate, credentialScope, sha256(canonicalRequest)].join("\n");
  const signature = createHmac("sha256", signingKey(r2.secretAccessKey, dateStamp)).update(stringToSign).digest("hex");
  const authorization = `${algorithm} Credential=${r2.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders(headers)}, Signature=${signature}`;
  return $fetch.raw(`https://${r2.host}${pathFor(r2, key)}`, { method, headers: { ...headers, authorization } });
};

export const inspectPrivateUpload = async (upload) => {
  if (!upload?.key?.match(/^commandes\/pending\/[a-f0-9-]{36}\.[a-z0-9]{1,12}$/)) {
    throw createError({ statusCode: 400, statusMessage: "Référence de photo invalide." });
  }
  const response = await signedR2Request("HEAD", upload.key);
  const type = response.headers.get("content-type")?.toLowerCase();
  const size = Number(response.headers.get("content-length"));
  if (!allowedImageTypes.has(type) || !Number.isFinite(size) || size <= 0 || size > 5 * 1024 ** 3) {
    throw createError({ statusCode: 400, statusMessage: "La photo privée est invalide." });
  }
  return { key: upload.key, filename: String(upload.filename || "photo").slice(0, 180), type, size };
};
