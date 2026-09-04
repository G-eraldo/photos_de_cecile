import { findStoredOrder, findStoredReservation, getMollieConfig } from "../../../utils/mollie.js";

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

  return {
    reference: paymentRecord.reference,
    statut: paymentRecord.statut,
    type: order ? "commande" : "reservation",
    montant: order ? order.montant_total : reservation.montant_acompte,
  };
});
