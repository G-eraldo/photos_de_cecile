import { randomUUID } from "node:crypto";

import { RESERVATION_DURATION_MS } from "../../../../shared/utils/reservation-duration.js";
import {
  getGoogleAccessToken,
  listCalendarEvents,
} from "../../../utils/google-calendar.js";
import {
  createMolliePayment,
  createStoredReservation,
  findFormula,
  getMollieConfig,
  getTravelFee,
  listActiveReservationHolds,
  updateStoredReservation,
} from "../../../utils/mollie.js";
import { dateTimeInParis } from "../../../utils/paris-date-time.js";
import {
  enforceRateLimit,
  enforceTrustedOrigin,
} from "../../../utils/request-security.js";
import {
  buildAvailabilitySlots,
  isOfferedSlot,
} from "../../../utils/reservation-slots.js";

const requiredFields = [
  "nom",
  "prenom",
  "telephone",
  "email",
  "prestation",
  "forfait",
  "date",
  "heure",
  "socialUsage",
  "lieu",
];

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim() && value.length <= 500;

export default defineEventHandler(async (event) => {
  enforceTrustedOrigin(event);
  await enforceRateLimit(event, {
    scope: "reservation-payment",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  const details = await readBody(event);

  if (!requiredFields.every((field) => isNonEmptyString(details?.[field]))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Informations de réservation incomplètes.",
    });
  }
  if (
    !/^\S+@\S+\.\S+$/.test(details.email.trim()) ||
    ["adresse", "message"].some(
      (field) =>
        details[field] != null &&
        (typeof details[field] !== "string" || details[field].length > 2000),
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Coordonnées ou message invalides.",
    });
  }

  if (!["autorise", "n_autorise_pas"].includes(details.socialUsage)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Choix d’utilisation des photos invalide.",
    });
  }

  if (details.conditionsAccepted !== true) {
    throw createError({
      statusCode: 400,
      statusMessage: "Vous devez accepter les conditions de vente.",
    });
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(details.date) ||
    !/^\d{2}:\d{2}$/.test(details.heure)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Date ou créneau invalide.",
    });
  }

  const start = dateTimeInParis(details.date, details.heure);
  if (Number.isNaN(start.getTime()) || start <= new Date()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ce créneau n’est plus disponible.",
    });
  }

  const config = getMollieConfig();
  const end = new Date(start.getTime() + RESERVATION_DURATION_MS);
  const calendarConfig = useRuntimeConfig(event);
  const accessToken = await getGoogleAccessToken(calendarConfig);
  const events = await listCalendarEvents(
    calendarConfig,
    start,
    end,
    accessToken,
  );
  let holds = [];
  try {
    holds = await listActiveReservationHolds(config);
  } catch {
    holds = [];
  }
  const slots = buildAvailabilitySlots({ events, now: new Date(), holds });
  if (!isOfferedSlot(slots, start)) {
    throw createError({
      statusCode: 409,
      statusMessage:
        "Ce créneau n’est plus disponible. Merci d’en choisir un autre.",
    });
  }
  const {
    amount: formulaDeposit,
    percentage,
    formule,
    prestation,
  } = await findFormula(config, {
    prestationId: details.prestationId,
    prestationName: details.prestation.trim(),
    formuleId: details.formuleId,
    formuleName: details.forfait.trim(),
  });
  const fraisKilometriques = getTravelFee(details.lieu);
  const amount = (Number(formulaDeposit) + fraisKilometriques).toFixed(2);
  const reference = `r${randomUUID().replace(/-/g, "")}`;
  const reservationDetails = {
    nom: details.nom.trim(),
    prenom: details.prenom.trim(),
    telephone: details.telephone.trim(),
    email: details.email.trim(),
    prestation: prestation.nom,
    prestationId: prestation.documentId,
    forfait: formule.nom,
    formuleId: formule.id,
    date: details.date,
    heure: details.heure,
    lieu: details.lieu,
    socialUsage: details.socialUsage,
    conditionsAccepted: true,
    adresse: details.adresse?.trim() || "",
    message: details.message?.trim() || "",
    acomptePourcentage: percentage,
    fraisKilometriques,
    montantAcompteFormule: Number(formulaDeposit),
  };

  const reservation = await createStoredReservation(
    config,
    {
      reference,
      details: reservationDetails,
      montant_acompte: Number(amount),
      mollie_payment_id: `pending_${reference}`,
      statut: "en_attente",
    },
    { start: start.toISOString(), end: end.toISOString() },
  );

  try {
    const payment = await createMolliePayment(config, {
      amount,
      reference,
      description: `Acompte — ${reservationDetails.prestation} (${reservationDetails.forfait})`,
    });

    await updateStoredReservation(config, reservation.data.documentId, {
      mollie_payment_id: payment.id,
    });

    return { checkoutUrl: payment._links.checkout.href };
  } catch (error) {
    await updateStoredReservation(config, reservation.data.documentId, {
      statut: "echoue",
    });
    throw error;
  }
});
