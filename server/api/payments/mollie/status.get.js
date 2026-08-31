import { findStoredReservation, getMollieConfig } from "../../../utils/mollie.js";

export default defineEventHandler(async (event) => {
  const { reference } = getQuery(event);
  if (typeof reference !== "string" || !reference) {
    throw createError({ statusCode: 400, statusMessage: "Référence de réservation manquante." });
  }

  const reservation = await findStoredReservation(getMollieConfig(), "reference", reference);
  if (!reservation) {
    throw createError({ statusCode: 404, statusMessage: "Réservation introuvable." });
  }

  return {
    reference: reservation.reference,
    statut: reservation.statut,
    montantAcompte: reservation.montant_acompte,
  };
});
