import { finalizePaidPayment } from "../../../utils/mollie-paid-payment.js";
import {
  findStoredOrder,
  findStoredReservation,
  getMollieConfig,
  getMolliePayment,
} from "../../../utils/mollie.js";

export default defineEventHandler(async (event) => {
  const { reference } = getQuery(event);
  if (typeof reference !== "string" || !reference) {
    throw createError({ statusCode: 400, statusMessage: "Référence de réservation manquante." });
  }

  const config = getMollieConfig();
  const order = await findStoredOrder(config, "reference", reference);
  const reservation = order ? null : await findStoredReservation(config, "reference", reference);
  const paymentRecord = order || reservation;
  if (!paymentRecord) throw createError({ statusCode: 404, statusMessage: "Paiement introuvable." });

  // Secours si Mollie a redirigé la cliente avant que son webhook soit traité.
  // Seul Mollie est interrogé côté serveur ; le navigateur ne peut pas forcer
  // l'état « payé ».
  if (paymentRecord.statut === "en_attente" || paymentRecord.details?.finalisation?.statut === "erreur") {
    const payment = await getMolliePayment(config, paymentRecord.mollie_payment_id);
    const expectedAmount = Number(order ? order.montant_total : reservation.montant_acompte).toFixed(2);
    if (
      payment.status === "paid" &&
      payment.amount?.currency === "EUR" &&
      payment.amount?.value === expectedAmount &&
      payment.metadata?.reference === paymentRecord.reference &&
      payment.metadata?.type === (order ? "commande" : "reservation")
    ) {
      try {
        await finalizePaidPayment({
          event,
          config,
          order,
          reservation,
          paymentId: paymentRecord.mollie_payment_id,
        });
      } catch (error) {
        // Le paiement reste valable même si Calendar ou les e-mails doivent
        // être repris. Ne jamais transformer ce cas en une fausse 404 pour la
        // cliente : la réservation existe bien dans Strapi.
        console.error("Impossible de finaliser le paiement depuis la page de confirmation.", {
          reference: paymentRecord.reference,
          paymentId: paymentRecord.mollie_payment_id,
          message: error?.message,
          statusCode: error?.statusCode,
        });
      }
    }
  }

  const refreshedOrder = order ? await findStoredOrder(config, "reference", reference) : null;
  const refreshedReservation = order ? null : await findStoredReservation(config, "reference", reference);
  const refreshedRecord = refreshedOrder || refreshedReservation || paymentRecord;

  return {
    reference: refreshedRecord.reference,
    statut: refreshedRecord.statut,
    type: order ? "commande" : "reservation",
    montant: refreshedOrder ? refreshedOrder.montant_total : refreshedReservation?.montant_acompte || paymentRecord.montant_acompte,
    finalisation: refreshedRecord.details?.finalisation?.statut || null,
  };
});
