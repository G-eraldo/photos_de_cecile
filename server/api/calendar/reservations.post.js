import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Resend } from "resend";

import { generateContractPdf } from "../../utils/generate-contract-pdf.js";
import {
  calendarEventsUrl,
  getGoogleAccessToken,
  isAvailabilityEvent,
} from "../../utils/google-calendar.js";

const hasOverlap = (start, end, otherStart, otherEnd) =>
  start < otherEnd && end > otherStart;

export const completeReservation = async (event, body) => {
  const config = useRuntimeConfig(event);

  const {
    nom,
    prenom,
    adresse,
    telephone,
    email,
    prestation,
    date,
    lieu,
    heure,
    forfait,
    message,
    conditionsAccepted,
    socialUsage,
  } = body || {};

  if (
    ![
      nom,
      prenom,
      email,
      prestation,
      forfait,
      date,
      heure,
      socialUsage,
      telephone,
    ].every((value) => typeof value === "string" && value.trim())
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Informations de réservation incomplètes.",
    });
  }

  if (conditionsAccepted !== true) {
    throw createError({
      statusCode: 400,
      statusMessage: "Vous devez accepter les conditions de vente.",
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(heure)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Date ou créneau invalide.",
    });
  }

  const start = new Date(`${date}T${heure}:00`);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  if (Number.isNaN(start.getTime()) || start <= new Date()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ce créneau n’est plus disponible.",
    });
  }

  const accessToken = await getGoogleAccessToken(config);

  const url = new URL(calendarEventsUrl(config.googleCalendarId));

  url.search = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: "true",
  }).toString();

  const existing = await $fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const events = existing.items || [];

  const inAvailability = events.some(
    (item) =>
      isAvailabilityEvent(item) &&
      new Date(item.start?.dateTime || item.start?.date) <= start &&
      new Date(item.end?.dateTime || item.end?.date) >= end,
  );

  const alreadyReserved = events.some(
    (item) =>
      !isAvailabilityEvent(item) &&
      hasOverlap(
        start,
        end,
        new Date(item.start?.dateTime || item.start?.date),
        new Date(item.end?.dateTime || item.end?.date),
      ),
  );

  if (!inAvailability || alreadyReserved) {
    throw createError({
      statusCode: 409,
      statusMessage:
        "Ce créneau vient d’être réservé. Merci d’en choisir un autre.",
    });
  }

  await $fetch(calendarEventsUrl(config.googleCalendarId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      summary: `Réservation — ${prestation.trim()} (${forfait.trim()})`,
      description: `Client : ${prenom.trim()} ${nom.trim()}\nEmail : ${email.trim()}\nTéléphone : ${telephone?.trim() || "Non renseigné"}\nPrestation : ${prestation.trim()}\nFormule : ${forfait.trim()}\nAcompte : payé${
        message?.trim() ? `\nPrécisions : ${message.trim()}` : ""
      }\nConditions acceptées : ${conditionsAccepted}\nUsage des photos : ${socialUsage}`,

      start: {
        dateTime: `${date}T${heure}:00`,
        timeZone: "Europe/Paris",
      },

      end: {
        dateTime: `${date}T${String(start.getHours() + 2).padStart(
          2,
          "0",
        )}:${String(start.getMinutes()).padStart(2, "0")}:00`,
        timeZone: "Europe/Paris",
      },
    },
  });

  const pdfBuffer = await generateContractPdf({
    nom: nom.trim(),
    prenom: prenom.trim(),
    adresse: adresse?.trim() || "",
    telephone: telephone?.trim() || "",
    email: email.trim(),
    prestation: prestation.trim(),
    date,
    lieu: lieu?.trim() || "",
    heure,
    forfait: forfait.trim(),
    socialUsage,
  });

  /*
   * Guide canin uniquement pour la prestation
   * "Animaux de compagnie".
   */
  const isAnimalPrestation = prestation.trim() === "Animaux de compagnie";

  let guideCaninBuffer = null;

  if (isAnimalPrestation) {
    try {
      guideCaninBuffer = await readFile(
        resolve(process.cwd(), "public/guides/guide-canin.pdf"),
      );
    } catch (error) {
      console.error("Impossible de charger le guide canin.", error);
    }
  }

  let emailSent = true;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    /*
     * Logo PNG haute résolution.
     * Source : public/images/logo-email.png
     */
    const logoBuffer = await readFile(
      resolve(process.cwd(), "public/images/logo-email.png"),
    );

    const attachments = [
      {
        filename: "logo-email.png",
        content: logoBuffer,
        contentId: "logo-cecile",
        content_type: "image/png",
      },
      {
        filename: `Contrat_${prenom.trim()}_${nom.trim()}.pdf`,
        content: pdfBuffer,
      },
    ];

    if (guideCaninBuffer) {
      attachments.push({
        filename: "Guide_preparation_seance_canine.pdf",
        content: guideCaninBuffer,
      });
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email.trim(),

      subject: "Confirmation de votre réservation — Les Photos de Cécile",

      html: `
        <div style="
          margin:0;
          padding:40px 20px;
          background:#E6DFDD;
          font-family:Arial,sans-serif;
          color:#676463;
        ">

          <div style="
            max-width:600px;
            margin:0 auto;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
          ">

            <!-- En-tête avec logo -->
            <div style="
              padding:35px 30px 25px;
              text-align:center;
              background:#ffffff;
            ">

              <img
                src="cid:logo-cecile"
                alt="Les Photos de Cécile"
                width="160"
                style="
                  display:block;
                  width:160px;  
                  max-width:100%;
                  height:auto;
                  margin:0 auto 18px;
                  border:0;
                "
              />

              <div style="
                width:60px;
                height:1px;
                background:#D9D2CF;
                margin:0 auto;
              "></div>

            </div>

            <!-- Contenu -->
            <div style="
              padding:10px 35px 40px;
            ">

              <h1 style="
                font-family:Georgia,serif;
                font-size:25px;
                font-weight:normal;
                color:#5A3419;
                margin:0 0 25px;
              ">
                Votre réservation est confirmée
              </h1>

              <p style="
                font-size:15px;
                line-height:1.7;
              ">
                Bonjour ${prenom.trim()},
              </p>

              <p style="
                font-size:15px;
                line-height:1.7;
              ">
                Votre réservation pour une séance
                <strong style="color:#5A3419;">
                  ${prestation.trim()}
                </strong>
                a bien été enregistrée.
              </p>

              <!-- Récapitulatif -->
              <div style="
                margin:30px 0;
                padding:20px;
                background:#FAF8F7;
                border-radius:10px;
              ">

                <p style="margin:0 0 10px;">
                  <strong style="color:#5A3419;">
                    Date :
                  </strong>
                  ${date}
                </p>

                <p style="margin:0 0 10px;">
                  <strong style="color:#5A3419;">
                    Horaire :
                  </strong>
                  ${heure} —
                  ${String(start.getHours() + 2).padStart(2, "0")}:${String(
                    start.getMinutes(),
                  ).padStart(2, "0")}
                </p>

                <p style="margin:0;">
                  <strong style="color:#5A3419;">
                    Prestation :
                  </strong>
                  ${prestation.trim()}
                </p>
                <p style="margin:0;">
                  <strong style="color:#5A3419;">
                    Formule :
                  </strong>
                  ${forfait.trim()}
                </p>
                <p style="margin:0;">
                  <strong style="color:#5A3419;">
                    Lieu :
                  </strong>
                  ${lieu?.trim() || "À préciser"}
                </p>

              </div>

              <!-- Contrat -->
              <p style="
                font-size:15px;
                line-height:1.7;
              ">
                Vous trouverez en pièce jointe votre
                <strong>
                  contrat de prestation photographique
                </strong>,
                prérempli avec les informations communiquées
                lors de votre réservation.
              </p>

              <!-- Guide canin -->
              ${
                isAnimalPrestation && guideCaninBuffer
                  ? `
                    <div style="
                      margin:30px 0;
                      padding:24px;
                      background:#F8F4F1;
                      border:1px solid #E4D8D2;
                      border-radius:12px;
                    ">

                      <p style="
                        margin:0 0 10px;
                        font-family:Georgia,serif;
                        font-size:20px;
                        color:#5A3419;
                      ">
                        🐾 Bien préparer votre séance
                      </p>

                      <p style="
                        margin:0;
                        font-size:14px;
                        line-height:1.7;
                        color:#676463;
                      ">
                        Votre réservation concerne une séance avec votre
                        compagnon. Vous trouverez également en pièce jointe
                        le
                        <strong style="color:#5A3419;">
                          guide de préparation de votre séance photo canine
                        </strong>.
                      </p>

                      <p style="
                        margin:12px 0 0;
                        font-size:14px;
                        line-height:1.7;
                        color:#676463;
                      ">
                        Vous y trouverez les conseils de Cécile pour préparer
                        votre chien avant la séance et faire de ce moment
                        une expérience agréable pour vous deux.
                      </p>

                    </div>
                  `
                  : ""
              }

              <p style="
                font-size:15px;
                line-height:1.7;
              ">
                Merci de prendre connaissance du contrat et de le retourner signé
                conformément aux modalités indiquées.
              </p>

              ${
                isAnimalPrestation && guideCaninBuffer
                  ? `
                    <p style="
                      margin-top:25px;
                      font-size:14px;
                      line-height:1.7;
                      color:#8F8C85;
                    ">
                      📎 <strong>Pièces jointes :</strong><br>
                      Contrat de prestation photographique<br>
                      Guide de préparation de la séance canine
                    </p>
                  `
                  : ""
              }

              <p style="
                margin-top:30px;
                font-size:15px;
                line-height:1.7;
              ">
                À bientôt,<br>

                <strong style="color:#5A3419;">
                  Cécile
                </strong>
              </p>

            </div>

            <!-- Pied de mail -->
            <div style="
              padding:20px 30px;
              text-align:center;
              border-top:1px solid #D9D2CF;
              font-size:12px;
              line-height:1.6;
              color:#8F8C85;
            ">
              Les Photos de Cécile<br>
              8 allée sablée — 80000 Amiens<br>
              07717773859
            </div>

          </div>

        </div>
      `,

      attachments,
    });
  } catch (error) {
    emailSent = false;

    console.error(
      "Réservation créée, mais e-mail de confirmation non envoyé.",
      error,
    );
  }

  return {
    success: true,
    emailSent,
  };
};

export default defineEventHandler(async (event) => {
  throw createError({
    statusCode: 410,
    statusMessage:
      "Utilisez le paiement d’acompte pour confirmer une réservation.",
  });
});
