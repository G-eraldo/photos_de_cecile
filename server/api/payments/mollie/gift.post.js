import { getGiftOffers } from '../../../../shared/utils/gift-offers.js';
import { randomUUID } from "node:crypto";

import {
  createMolliePayment,
  createStoredOrder,
  getMollieConfig,
  updateStoredOrder,
} from "../../../utils/mollie.js";
import {
  enforceRateLimit,
  enforceTrustedOrigin,
} from "../../../utils/request-security.js";

const isText = (value, maximum = 500) =>
  typeof value === "string" && value.trim() && value.trim().length <= maximum;
const hasEmoji = (value) =>
  /[\p{Extended_Pictographic}\p{Regional_Indicator}]/u.test(value);

export default defineEventHandler(async (event) => {
  enforceTrustedOrigin(event);
  await enforceRateLimit(event, {
    scope: "gift-payment",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  const details = await readBody(event);
  const nom = details?.nom || "";
  const prenom = details?.prenom || "";
  const email = details?.email || "";
  const beneficiaire = details?.beneficiaire || "";
  const message = details?.message || "";
  const adresse = details?.adresse || "";
  const prestation = details?.prestation;
  const photos = Number(details?.photos);
  const delivery = details?.delivery;
  const offer = getGiftOffers().find((item) => item.value === prestation);
  const choice = offer?.choices.find((item) => item.photos === photos);

  if (
    ![nom, prenom, email, beneficiaire].every((field) => isText(field)) ||
    !/^\S+@\S+\.\S+$/.test(email.trim())
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Merci de renseigner vos coordonnées et le bénéficiaire.",
    });
  }
  if (!choice) {
    throw createError({
      statusCode: 400,
      statusMessage: "La prestation ou le forfait choisi est invalide.",
    });
  }
  if (!["email", "courrier"].includes(delivery)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Le mode de réception est invalide.",
    });
  }
  if (details?.conditionsAccepted !== true) {
    throw createError({
      statusCode: 400,
      statusMessage: "Vous devez accepter les conditions de vente.",
    });
  }
  if (delivery === "courrier" && !isText(adresse)) {
    throw createError({
      statusCode: 400,
      statusMessage: "L’adresse d’envoi du bon cadeau est requise.",
    });
  }
  if (message && !isText(message, 250)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Le message ne peut pas dépasser 250 caractères.",
    });
  }
  if (hasEmoji(message)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Les emojis ne sont pas autorisés dans le message.",
    });
  }

  const price = choice.price;
  if (details.expectedPrice !== undefined && details.expectedPrice !== price) {
    throw createError({
      statusCode: 409,
      statusMessage: "Le tarif a changé. Vérifiez le montant avant de payer.",
    });
  }
  const total = price + (delivery === "courrier" ? 5 : 0);
  const reference = `c${randomUUID().replace(/-/g, "")}`;
  const orderDetails = {
    type: "bon_cadeau",
    nom: nom.trim(),
    prenom: prenom.trim(),
    email: email.trim(),
    adresse: adresse.trim(),
    beneficiaire: beneficiaire.trim(),
    message: message.trim(),
    prestation: offer.label,
    produit: "Bon cadeau",
    produitSlug: "bon-cadeau",
    format: `${photos} photos`,
    quantite: 1,
    prixUnitaire: price,
    options: {
      prestation: offer.label,
      réception: delivery === "courrier" ? "Par courrier (+5 €)" : "Par e-mail",
    },
  };
  const config = getMollieConfig();
  const order = await createStoredOrder(config, {
    reference,
    details: orderDetails,
    type_commande: "bon_cadeau",
    montant_total: total,
    mollie_payment_id: `pending_${reference}`,
    statut: "en_attente",
    photo_privee: { type: "bon_cadeau" },
  });

  try {
    const payment = await createMolliePayment(config, {
      amount: total.toFixed(2),
      reference,
      description: `Bon cadeau ${offer.label} - ${photos} photos`,
      confirmationPath: "/offrir/confirmation",
      paymentType: "commande",
    });
    await updateStoredOrder(config, order.data.documentId, {
      mollie_payment_id: payment.id,
    });
    return { checkoutUrl: payment._links.checkout.href };
  } catch (error) {
    await updateStoredOrder(config, order.data.documentId, {
      statut: "echoue",
    });
    throw error;
  }
});
