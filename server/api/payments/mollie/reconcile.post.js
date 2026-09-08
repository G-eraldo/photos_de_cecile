import { timingSafeEqual } from "node:crypto";
import { getMollieConfig, getMolliePayment, listPaymentsForReconciliation, updateStoredOrder, updateStoredReservation } from "../../../utils/mollie.js";
import { finalizePaidPayment } from "../../../utils/mollie-paid-payment.js";
import { isFinalisationStale } from "../../../utils/payment-finalisation.js";

export default defineEventHandler(async (event) => {
  const expected = Buffer.from(process.env.PAYMENT_RECONCILIATION_SECRET || "");
  const supplied = Buffer.from(getRequestHeader(event, "x-payment-operations-secret") || "");
  if (expected.length < 32 || expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    throw createError({ statusCode: 401, statusMessage: "Accès non autorisé." });
  }
  const body = await readBody(event) || {};
  const type = body.type;
  const start = body.start ?? 0;
  const limit = body.limit ?? 25;
  if (!["commande", "reservation"].includes(type) || !Number.isInteger(start) || start < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw createError({ statusCode: 400, statusMessage: "Pagination invalide." });
  }
  const config = getMollieConfig();
  const { data: records = [] } = await listPaymentsForReconciliation(config, type, start, limit);
  const results = [];
  for (const record of records) {
    if (record.details?.finalisation?.statut === "remboursement_demande") continue;
    const retry = record.statut === "en_attente" || record.details?.finalisation?.statut === "erreur" || isFinalisationStale(record.details) || record.details?.emailEnvoye === false || record.details?.notificationCecileEnvoyee === false;
    if (!retry) continue;
    if (record.mollie_payment_id?.startsWith("pending_")) {
      results.push({ reference: record.reference, manualReview: true, reason: "payment_link_missing" });
      continue;
    }
    try {
      const payment = await getMolliePayment(config, record.mollie_payment_id);
      const amount = Number(type === "commande" ? record.montant_total : record.montant_acompte).toFixed(2);
      if (payment.metadata?.reference !== record.reference || payment.metadata?.type !== type || payment.amount?.currency !== "EUR" || payment.amount?.value !== amount) {
        results.push({ reference: record.reference, manualReview: true, reason: "payment_mismatch" });
        continue;
      }
      if (payment.status === "paid") {
        const result = await finalizePaidPayment({ event, config, [type === "commande" ? "order" : "reservation"]: record });
        results.push({ reference: record.reference, ...result });
      } else if (["canceled", "failed", "expired"].includes(payment.status)) {
        const update = type === "commande" ? updateStoredOrder : updateStoredReservation;
        await update(config, record.documentId, { statut: { canceled: "annule", failed: "echoue", expired: "expire" }[payment.status] });
      }
    } catch (error) {
      results.push({ reference: record.reference, failed: true, statusCode: error?.statusCode || 500 });
    }
  }
  setResponseHeader(event, "Cache-Control", "no-store");
  return { results, nextStart: records.length === limit ? start + limit : null };
});
