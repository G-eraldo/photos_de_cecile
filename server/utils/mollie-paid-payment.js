import { randomUUID } from "node:crypto";

import { completeReservation } from "../api/calendar/reservations.post.js";
import { sendOrderConfirmation } from "./order-email.js";
import { finalizePrivateUpload } from "./r2-private.js";
import {
  findStoredOrder,
  findStoredReservation,
  updateStoredOrder,
  updateStoredReservation,
} from "./mollie.js";

// Réduit les appels simultanés dans une même instance. Le verrou est aussi
// enregistré dans Strapi afin qu'un nouvel appel puisse reprendre proprement
// une finalisation interrompue après un redémarrage.
const processingPaymentIds = new Set();

const getFinalisation = (details) => details?.finalisation || null;

export const finalizePaidPayment = async ({ event, config, order, reservation, paymentId }) => {
  const isOrder = Boolean(order);
  const record = order || reservation;
  const updateRecord = isOrder ? updateStoredOrder : updateStoredReservation;
  const findRecord = isOrder ? findStoredOrder : findStoredReservation;
  const finalisation = getFinalisation(record.details);

  // Les paiements déjà finalisés (ou historiques) ne doivent jamais renvoyer
  // d'e-mail ou créer un second événement Calendar.
  if (record.statut === "paye") {
    if (!finalisation || finalisation.statut === "terminee") return { alreadyFinalized: true };
    if (finalisation.statut === "en_cours") return { processing: true };
  }
  if (processingPaymentIds.has(paymentId)) return { processing: true };

  processingPaymentIds.add(paymentId);
  const attemptId = randomUUID();
  const startedAt = new Date().toISOString();
  const claimedDetails = {
    ...record.details,
    paiementConfirmeLe: record.details?.paiementConfirmeLe || startedAt,
    finalisation: {
      statut: "en_cours",
      tentativeId: attemptId,
      demarreeLe: startedAt,
    },
  };

  try {
    // Le paiement est visible immédiatement : une panne e-mail/Calendar ne
    // laisse plus une cliente payée bloquée sur « en attente ».
    await updateRecord(config, record.documentId, {
      statut: "paye",
      details: claimedDetails,
    });

    const latestRecord = await findRecord(config, "mollie_payment_id", paymentId);
    if (latestRecord?.details?.finalisation?.tentativeId !== attemptId) {
      return { processing: true };
    }

    if (isOrder) {
      const photoPrivee = record.details?.type === "bon_cadeau"
        ? record.photo_privee
        : await finalizePrivateUpload(record.photo_privee, record.reference);
      const emailResult = await sendOrderConfirmation({
        reference: record.reference,
        details: record.details,
        total: record.montant_total,
      });
      await updateStoredOrder(config, record.documentId, {
        statut: "paye",
        photo_privee: photoPrivee,
        details: {
          ...claimedDetails,
          emailEnvoye: emailResult.customerEmailSent,
          notificationCecileEnvoyee: emailResult.cecileEmailSent,
          finalisation: { ...claimedDetails.finalisation, statut: "terminee", termineeLe: new Date().toISOString() },
        },
      });
      return { completed: true };
    }

    const result = await completeReservation(event, {
      ...reservation.details,
      reference: reservation.reference,
    });
    await updateStoredReservation(config, reservation.documentId, {
      statut: "paye",
      details: {
        ...claimedDetails,
        emailEnvoye: result.emailSent,
        notificationCecileEnvoyee: result.cecileEmailSent,
        finalisation: { ...claimedDetails.finalisation, statut: "terminee", termineeLe: new Date().toISOString() },
      },
    });
    return { completed: true };
  } catch (error) {
    console.error("La finalisation du paiement a échoué.", {
      reference: record.reference,
      paymentId,
      type: isOrder ? "commande" : "reservation",
      message: error?.message,
      statusCode: error?.statusCode,
    });
    await updateRecord(config, record.documentId, {
      statut: "paye",
      details: {
        ...claimedDetails,
        finalisation: {
          ...claimedDetails.finalisation,
          statut: "erreur",
          derniereErreur: "La confirmation automatique doit être relancée.",
          echoueeLe: new Date().toISOString(),
        },
      },
    }).catch(() => {});
    throw error;
  } finally {
    processingPaymentIds.delete(paymentId);
  }
};
