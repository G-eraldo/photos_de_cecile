import { completeReservation } from "../../calendar/reservations.post.js";
import { sendOrderConfirmation } from "../../../utils/order-email.js";
import {
  findStoredOrder,
  findStoredReservation,
  getMollieConfig,
  getMolliePayment,
  updateStoredOrder,
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
  const order = await findStoredOrder(config, "mollie_payment_id", paymentId);
  const reservation = order ? null : await findStoredReservation(config, "mollie_payment_id", paymentId);
  const paymentRecord = order || reservation;
  if (!paymentRecord) throw createError({ statusCode: 404, statusMessage: "Paiement introuvable." });

  const payment = await getMolliePayment(config, paymentId);
  if (payment.status !== "paid") {
    const status = statusFromMollie[payment.status] || "en_attente";
    if (status !== paymentRecord.statut) {
      if (order) await updateStoredOrder(config, order.documentId, { statut: status });
      else await updateStoredReservation(config, reservation.documentId, { statut: status });
    }
    return { received: true };
  }

  if (paymentRecord.statut === "paye") {
    return { received: true };
  }

  if (order) {
    const emailSent = await sendOrderConfirmation({ reference: order.reference, details: order.details, total: order.montant_total });
    await updateStoredOrder(config, order.documentId, {
      statut: "paye",
      details: { ...order.details, paiementConfirmeLe: new Date().toISOString(), emailEnvoye: emailSent },
    });
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
