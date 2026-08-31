import { randomUUID } from "node:crypto";

import {
  createMolliePayment,
  createStoredReservation,
  findFormula,
  getMollieConfig,
  updateStoredReservation,
} from "../../../utils/mollie.js";

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
];

const isNonEmptyString = (value) => typeof value === "string" && value.trim();

export default defineEventHandler(async (event) => {
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

  const start = new Date(`${details.date}T${details.heure}:00`);
  if (Number.isNaN(start.getTime()) || start <= new Date()) {
    throw createError({ statusCode: 400, statusMessage: "Ce créneau n’est plus disponible." });
  }

  const config = getMollieConfig();
  const { amount, percentage } = await findFormula(config, details.prestation.trim(), details.forfait.trim());
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
