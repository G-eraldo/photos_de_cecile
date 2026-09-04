import { Resend } from "resend";

import {
  enforceRateLimit,
  enforceTrustedOrigin,
} from "../utils/request-security.js";

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
const isText = (value, maximum) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= maximum;
const isEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default defineEventHandler(async (event) => {
  enforceTrustedOrigin(event);
  enforceRateLimit(event, {
    scope: "contact",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  const { nom, prenom, email, message } = (await readBody(event)) || {};

  if (
    !isText(nom, 100) ||
    !isText(prenom, 100) ||
    !isEmail(email) ||
    !isText(message, 3000)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Merci de renseigner un nom, un prénom, un e-mail et un message valide.",
    });
  }
  if (!process.env.RESEND_API_KEY) {
    throw createError({
      statusCode: 503,
      statusMessage: "Le formulaire de contact n’est pas encore configuré.",
    });
  }

  const safeNom = escapeHtml(nom.trim());
  const safePrenom = escapeHtml(prenom.trim());
  const safeEmail = escapeHtml(email.trim());
  const safeMessage = escapeHtml(message.trim()).replace(/\r?\n/g, "<br>");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: process.env.RESEND_CECILE_NOTIFICATION_EMAIL,
    replyTo: email.trim(),
    subject: `Nouvelle demande de contact — ${prenom.trim()} ${nom.trim()}`,
    html: `<div style="margin:0;padding:40px 20px;background:#E6DFDD;font-family:Arial,sans-serif;color:#676463;"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;"><div style="padding:30px 35px;background:#503D30;color:#fff;"><p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#E6D4C4;">Les Photos de Cécile</p><h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:27px;font-weight:normal;">Nouvelle demande de contact</h1></div><div style="padding:30px 35px;"><p>Bonjour Cécile,</p><table role="presentation" width="100%" style="margin:22px 0;border-collapse:collapse;"><tr><td style="padding:7px 0;color:#8F8C85;width:35%;">Nom</td><td style="padding:7px 0;color:#503D30;font-weight:600;">${safePrenom} ${safeNom}</td></tr><tr><td style="padding:7px 0;color:#8F8C85;">E-mail</td><td style="padding:7px 0;color:#503D30;font-weight:600;">${safeEmail}</td></tr></table><p style="margin:0 0 8px;color:#5A3419;font-weight:bold;">Message</p><div style="padding:18px;background:#FAF8F7;border-left:3px solid #5A3419;border-radius:8px;line-height:1.7;">${safeMessage}</div></div></div></div>`,
  });
  return {
    success: true,
    message:
      "Votre message a bien été envoyé. Cécile vous répondra rapidement.",
  };
});
