import { finalizePaidPayment } from "../../../utils/mollie-paid-payment.js";
import {
  findStoredOrder,
  findStoredReservation,
  getMollieConfig,
  getMolliePayment,
  updateStoredOrder,
  updateStoredReservation,
} from "../../../utils/mollie.js";
import { deletePrivateUpload } from "../../../utils/r2-private.js";
import { enforceRateLimit } from "../../../utils/request-security.js";

const statusFromMollie = {
  canceled: "annule",
  expired: "expire",
  failed: "echoue",
};

const attachMollieId = async (config, record, type, paymentId) => {
  if (!record.mollie_payment_id?.startsWith("pending_")) return record;
  if (type === "commande")
    await updateStoredOrder(config, record.documentId, {
      mollie_payment_id: paymentId,
    });
  else
    await updateStoredReservation(config, record.documentId, {
      mollie_payment_id: paymentId,
    });
  return { ...record, mollie_payment_id: paymentId };
};

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, {
    scope: "mollie-webhook",
    limit: 120,
    windowMs: 15 * 60 * 1000,
  });
  const body = await readBody(event);
  const paymentId = typeof body?.id === "string" ? body.id : "";

  if (!paymentId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Identifiant de paiement manquant.",
    });
  }

  const config = getMollieConfig();
  let order = await findStoredOrder(config, "mollie_payment_id", paymentId);
  let reservation = order
    ? null
    : await findStoredReservation(config, "mollie_payment_id", paymentId);
  if (!order && !reservation) {
    const payment = await getMolliePayment(config, paymentId).catch(() => null);
    const reference = payment?.metadata?.reference;
    if (typeof reference === "string" && /^[cr][a-f0-9]{32}$/.test(reference)) {
      order = await findStoredOrder(config, "reference", reference);
      reservation = order
        ? null
        : await findStoredReservation(config, "reference", reference);
      if (order)
        order = await attachMollieId(config, order, "commande", paymentId);
      else if (reservation)
        reservation = await attachMollieId(
          config,
          reservation,
          "reservation",
          paymentId,
        );
    }
  }
  const paymentRecord = order || reservation;
  if (!paymentRecord)
    throw createError({
      statusCode: 404,
      statusMessage: "Paiement introuvable.",
    });

  const payment = await getMolliePayment(config, paymentId);
  const expectedAmount = Number(
    order ? order.montant_total : reservation.montant_acompte,
  ).toFixed(2);
  if (
    payment.amount?.currency !== "EUR" ||
    payment.amount?.value !== expectedAmount ||
    payment.metadata?.reference !== paymentRecord.reference ||
    payment.metadata?.type !== (order ? "commande" : "reservation")
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Les informations de paiement ne correspondent pas à la commande.",
    });
  }
  if (payment.status !== "paid") {
    const status = statusFromMollie[payment.status] || "en_attente";
    if (status !== paymentRecord.statut) {
      if (order) {
        await updateStoredOrder(config, order.documentId, { statut: status });
        if (["annule", "expire", "echoue"].includes(status)) {
          const photos = Array.isArray(order.photo_privee)
            ? order.photo_privee
            : [order.photo_privee];
          await Promise.all(
            photos.map((photo) => deletePrivateUpload(photo?.key)),
          );
        }
      } else
        await updateStoredReservation(config, reservation.documentId, {
          statut: status,
        });
    }
    return { received: true };
  }

  await finalizePaidPayment({ event, config, order, reservation, paymentId });

  return { received: true };
});
