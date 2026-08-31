import { completeReservation } from "../../calendar/reservations.post.js";
import {
  findStoredReservation,
  getMollieConfig,
  getMolliePayment,
  updateStoredReservation,
} from "../../../utils/mollie.js";

const statusFromMollie = {
  canceled: "annule",
  expired: "expire",
  failed: "echoue",
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const paymentId = typeof body?.id === "string" ? body.id : "";

  if (!paymentId) {
    throw createError({ statusCode: 400, statusMessage: "Identifiant de paiement manquant." });
  }

  const config = getMollieConfig();
  const reservation = await findStoredReservation(config, "mollie_payment_id", paymentId);
  if (!reservation) {
    throw createError({ statusCode: 404, statusMessage: "Réservation introuvable." });
  }

  const payment = await getMolliePayment(config, paymentId);
  if (payment.status !== "paid") {
    const status = statusFromMollie[payment.status] || "en_attente";
    if (status !== reservation.statut) {
      await updateStoredReservation(config, reservation.documentId, { statut: status });
    }
    return { received: true };
  }

  if (reservation.statut === "paye") {
    return { received: true };
  }

  const result = await completeReservation(event, reservation.details);
  await updateStoredReservation(config, reservation.documentId, {
    statut: "paye",
    details: {
      ...reservation.details,
      paiementConfirmeLe: new Date().toISOString(),
      emailEnvoye: result.emailSent,
    },
  });

  return { received: true };
});
