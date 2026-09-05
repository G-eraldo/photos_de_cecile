import { randomUUID } from "node:crypto";

import {
  createMolliePayment,
  createStoredReservation,
  findFormula,
  getMollieConfig,
  getTravelFee,
  updateStoredReservation,
} from "../../../utils/mollie.js";
import { ensureGoogleCalendarWriterAccess } from "../../../utils/google-calendar.js";
import { dateTimeInParis } from "../../../utils/paris-date-time.js";
import { enforceRateLimit, enforceTrustedOrigin } from "../../../utils/request-security.js";

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

const isNonEmptyString = (value) => typeof value === "string" && value.trim();

export default defineEventHandler(async (event) => {
  enforceTrustedOrigin(event);
  enforceRateLimit(event, { scope: "reservation-payment", limit: 5, windowMs: 15 * 60 * 1000 });
  const details = await readBody(event);

  if (!requiredFields.every((field) => isNonEmptyString(details?.[field]))) {
    throw createError({ statusCode: 400, statusMessage: "Informations de réservation incomplètes." });
  }

  if (details.conditionsAccepted !== true) {
    throw createError({ statusCode: 400, statusMessage: "Vous devez accepter les conditions de vente." });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(details.date) || !/^\d{2}:\d{2}$/.test(details.heure)) {
    throw createError({ statusCode: 400, statusMessage: "Date ou créneau invalide." });
  }

  const start = dateTimeInParis(details.date, details.heure);
  if (Number.isNaN(start.getTime()) || start <= new Date()) {
    throw createError({ statusCode: 400, statusMessage: "Ce créneau n’est plus disponible." });
  }

  const config = getMollieConfig();
  // Ne jamais encaisser un acompte si le compte Google ne peut pas créer le
  // rendez-vous correspondant. Cette vérification ne modifie pas Calendar.
  await ensureGoogleCalendarWriterAccess(useRuntimeConfig(event));
  const { amount: formulaDeposit, percentage } = await findFormula(config, {
    prestationId: details.prestationId,
    prestationName: details.prestation.trim(),
    formuleId: details.formuleId,
    formuleName: details.forfait.trim(),
  });
  const fraisKilometriques = getTravelFee(details.lieu);
  const amount = (Number(formulaDeposit) + fraisKilometriques).toFixed(2);
  const reference = `r${randomUUID().replace(/-/g, "")}`;
  const reservationDetails = {
    ...details,
    nom: details.nom.trim(),
    prenom: details.prenom.trim(),
    telephone: details.telephone.trim(),
    email: details.email.trim(),
    prestation: details.prestation.trim(),
    forfait: details.forfait.trim(),
    acomptePourcentage: percentage,
    fraisKilometriques,
    montantAcompteFormule: Number(formulaDeposit),
  };

  const reservation = await createStoredReservation(config, {
    reference,
    details: reservationDetails,
    montant_acompte: Number(amount),
    mollie_payment_id: `pending_${reference}`,
    statut: "en_attente",
  });

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
    await updateStoredReservation(config, reservation.data.documentId, { statut: "echoue" });
    throw error;
  }
});
