import { randomUUID } from "node:crypto";

import {
  createMolliePayment,
  createStoredOrder,
  findProductForOrder,
  getMollieConfig,
  updateStoredOrder,
} from "../../../utils/mollie.js";
import {
  inspectPrivateUpload,
  verifyPrivateUploadToken,
} from "../../../utils/r2-private.js";
import {
  enforceRateLimit,
  enforceTrustedOrigin,
} from "../../../utils/request-security.js";

const isText = (value, maximum = 500) =>
  typeof value === "string" && value.trim() && value.trim().length <= maximum;

export default defineEventHandler(async (event) => {
  enforceTrustedOrigin(event);
  enforceRateLimit(event, {
    scope: "order-payment",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  const details = await readBody(event);
  const nom = details?.nom || "";
  const prenom = details?.prenom || "";
  const email = details?.email || "";
  const adresse = details?.adresse || "";
  const productId = details?.productId;
  const slug = details?.slug || "";
  const format = details?.format || "";
  const options = details?.options;
  const delivery = details?.delivery || "";
  const quantity = Number(details?.quantity);

  if (
    ![nom, prenom, email, format].every((field) => isText(field)) ||
    !/^\S+@\S+\.\S+$/.test(email.trim())
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Merci de renseigner vos coordonnées et l’adresse de livraison.",
    });
  }
  if (!['retrait', 'courrier'].includes(delivery)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Le mode de réception sélectionné est invalide.",
    });
  }
  if (delivery === 'courrier' && !isText(adresse)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Merci de renseigner l’adresse de livraison.",
    });
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    throw createError({
      statusCode: 400,
      statusMessage: "La quantité doit être comprise entre 1 et 20.",
    });
  }
  if (!options || Array.isArray(options) || typeof options !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "Les options de tirage sont invalides.",
    });
  }

  const config = getMollieConfig();
  const product = await findProductForOrder(config, { productId, slug });
  if (
    (!Array.isArray(product.tarifs_formats) && !Array.isArray(product.formats)) ||
    !(product.tarifs_formats || product.formats).some((item) =>
      typeof item === 'string' ? item === format.trim() : item?.format === format.trim(),
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Le format sélectionné est invalide.",
    });
  }
  for (const [name, selected] of Object.entries(options)) {
    if (
      !Array.isArray(product.options?.[name]) ||
      !product.options[name].includes(selected)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "Une option de tirage est invalide.",
      });
    }
  }
  for (const optionName of Object.keys(product.options || {})) {
    if (!Object.hasOwn(options, optionName)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Merci de sélectionner toutes les options de tirage.",
      });
    }
  }

  const uploadedPhoto = await inspectPrivateUpload(
    verifyPrivateUploadToken(details?.uploadToken),
  );
  const reference = `c${randomUUID().replace(/-/g, "")}`;
  const selectedTariff = Array.isArray(product.tarifs_formats)
    ? product.tarifs_formats.find((item) => item?.format === format.trim())
    : null;
  const formatPrice = Number(selectedTariff?.prix ?? product.prix_a_partir_de);
  if (!Number.isFinite(formatPrice) || formatPrice < 0) {
    throw createError({ statusCode: 400, statusMessage: "Le tarif du format sélectionné est invalide." });
  }
  const hasFringedEdges = Object.entries(options).some(([name, value]) =>
    /bord|finition/i.test(name) && /frang/i.test(String(value)),
  );
  const fringeFee = hasFringedEdges ? Number(product.supplement_bords_franges ?? 1) : 0;
  const deliveryFee = delivery === 'courrier' ? Number(product.supplement_courrier ?? 5) : 0;
  if (!Number.isFinite(fringeFee) || fringeFee < 0 || !Number.isFinite(deliveryFee) || deliveryFee < 0) {
    throw createError({ statusCode: 400, statusMessage: "Les suppléments du produit sont invalides." });
  }
  const price = Number((formatPrice + fringeFee).toFixed(2));
  const total = Number(((price * quantity) + deliveryFee).toFixed(2));
  const orderDetails = {
    nom: nom.trim(),
    prenom: prenom.trim(),
    email: email.trim(),
    adresse: adresse.trim(),
    produit: product.titre,
    produitSlug: product.slug,
    format: format.trim(),
    options: {
      ...options,
      réception: delivery === 'courrier' ? `Par courrier (+${deliveryFee.toFixed(2)} €)` : 'Retrait auprès de Cécile',
    },
    quantite: quantity,
    prixUnitaire: price,
    fraisLivraison: deliveryFee,
    photoNom: uploadedPhoto.filename,
  };
  const order = await createStoredOrder(config, {
    reference,
    details: orderDetails,
    montant_total: total,
    mollie_payment_id: `pending_${reference}`,
    statut: "en_attente",
    photo_privee: uploadedPhoto,
  });

  try {
    const payment = await createMolliePayment(config, {
      amount: total.toFixed(2),
      reference,
      description: `Commande — ${product.titre} × ${quantity}`,
      confirmationPath: "/tirages-photo/confirmation",
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
