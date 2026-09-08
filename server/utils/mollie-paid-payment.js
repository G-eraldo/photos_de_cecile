import { completeReservation } from "../api/calendar/reservations.post.js";
import { sendOrderConfirmation } from "./order-email.js";
import { finalizePrivateUpload } from "./r2-private.js";
import { paymentOperation, refundUnavailableReservation } from "./mollie.js";

// The database lease serializes workers. Calendar IDs and Resend keys make
// external effects safe when a worker crashes before committing its result.
export const finalizePaidPayment = async ({ event, config, order, reservation }) => {
  const type = order ? "commande" : "reservation";
  const original = order || reservation;
  const claim = await paymentOperation(config, { operation: "claim", type, documentId: original.documentId });
  if (!claim.data) return claim;
  const record = claim.data;
  const checkpoint = (details) => paymentOperation(config, { operation: "checkpoint", type, documentId: record.documentId, attemptId: claim.attemptId, patch: { details } });
  const callbacks = {
    onCustomerSent: () => checkpoint({ emailEnvoye: true }),
    onCecileSent: () => checkpoint({ notificationCecileEnvoyee: true }),
  };
  const finish = (state, patch) => paymentOperation(config, {
    operation: "finish", type, documentId: record.documentId,
    attemptId: claim.attemptId, state, patch,
  });
  const refund = async () => {
    const result = await refundUnavailableReservation(config, record);
    await finish("remboursement_demande", { statut: "annule", details: { remboursementId: result.id, remboursementStatut: result.status } });
    return { refunded: true };
  };
  try {
    if (claim.slotConflict) return await refund();
    // Resend guarantees deduplication for 24 hours. After that, stop uncertain
    // delivery for manual verification rather than risk sending a second email.
    if (Date.now() - Date.parse(record.details.paiementConfirmeLe) >= 23 * 60 * 60 * 1000 &&
      (record.details.emailEnvoye !== true || record.details.notificationCecileEnvoyee !== true)) {
      await finish("erreur", { details: { verificationEmailRequise: true } });
      return { manualReview: true };
    }
    if (order) {
      const photoPrivee = record.details?.type === "bon_cadeau" ? record.photo_privee
        : Array.isArray(record.photo_privee)
          ? await Promise.all(record.photo_privee.map((photo) => finalizePrivateUpload(photo, record.reference)))
          : await finalizePrivateUpload(record.photo_privee, record.reference);
      const result = await sendOrderConfirmation({ reference: record.reference, details: record.details, total: record.montant_total }, callbacks);
      await finish(result.customerEmailSent && result.cecileEmailSent ? "terminee" : "erreur", {
        photo_privee: photoPrivee,
        details: { emailEnvoye: result.customerEmailSent, notificationCecileEnvoyee: result.cecileEmailSent },
      });
      return { completed: result.customerEmailSent && result.cecileEmailSent };
    }
    let result;
    try {
      result = await completeReservation(event, { ...record.details, reference: record.reference }, callbacks);
    } catch (error) {
      if ((error?.statusCode || error?.status) === 409) return await refund();
      throw error;
    }
    await finish(result.emailSent && result.cecileEmailSent ? "terminee" : "erreur", {
      details: { emailEnvoye: result.emailSent, notificationCecileEnvoyee: result.cecileEmailSent },
    });
    return { completed: result.emailSent && result.cecileEmailSent };
  } catch (error) {
    console.error("La finalisation du paiement a échoué.", { reference: record.reference, type, statusCode: error?.statusCode });
    await finish("erreur", { details: { derniereErreur: "La confirmation automatique doit être relancée." } }).catch(() => {});
    throw error;
  }
};
