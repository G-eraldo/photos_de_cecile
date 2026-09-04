import { completeReservation } from "../../calendar/reservations.post.js";
import { sendOrderConfirmation } from "../../../utils/order-email.js";
import { deletePrivateUpload, finalizePrivateUpload } from "../../../utils/r2-private.js";
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
  const expectedAmount = Number(order ? order.montant_total : reservation.montant_acompte).toFixed(2);
  if (
    payment.amount?.currency !== "EUR" ||
    payment.amount?.value !== expectedAmount ||
    payment.metadata?.reference !== paymentRecord.reference ||
    payment.metadata?.type !== (order ? "commande" : "reservation")
  ) {
    throw createError({ statusCode: 400, statusMessage: "Les informations de paiement ne correspondent pas à la commande." });
  }
  if (payment.status !== "paid") {
    const status = statusFromMollie[payment.status] || "en_attente";
    if (status !== paymentRecord.statut) {
      if (order) {
        await updateStoredOrder(config, order.documentId, { statut: status });
        if (["annule", "expire", "echoue"].includes(status)) await deletePrivateUpload(order.photo_privee?.key);
      }
      else await updateStoredReservation(config, reservation.documentId, { statut: status });
    }
    return { received: true };
  }

  if (paymentRecord.statut === "paye") {
    return { received: true };
  }

  if (order) {
    const photoPrivee = await finalizePrivateUpload(order.photo_privee, order.reference);
    const emailResult = await sendOrderConfirmation({ reference: order.reference, details: order.details, total: order.montant_total });
    await updateStoredOrder(config, order.documentId, {
      statut: "paye",
      details: {
        ...order.details,
        paiementConfirmeLe: new Date().toISOString(),
        emailEnvoye: emailResult.customerEmailSent,
        notificationCecileEnvoyee: emailResult.cecileEmailSent,
      },
      photo_privee: photoPrivee,
    });
    return { received: true };
  }

  const result = await completeReservation(event, { ...reservation.details, reference: reservation.reference });
  await updateStoredReservation(config, reservation.documentId, {
    statut: "paye",
    details: {
      ...reservation.details,
      paiementConfirmeLe: new Date().toISOString(),
      emailEnvoye: result.emailSent,
      notificationCecileEnvoyee: result.cecileEmailSent,
    },
  });

  return { received: true };
});
