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
  const quantity = Number(details?.quantity);

  if (
    ![nom, prenom, email, adresse, format].every((field) => isText(field)) ||
    !/^\S+@\S+\.\S+$/.test(email.trim())
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Merci de renseigner vos coordonnées et l’adresse de livraison.",
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
    !Array.isArray(product.formats) ||
    !product.formats.includes(format.trim())
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
  const price = Number(product.prix_a_partir_de);
  const total = Number((price * quantity).toFixed(2));
  const orderDetails = {
    nom: nom.trim(),
    prenom: prenom.trim(),
    email: email.trim(),
    adresse: adresse.trim(),
    produit: product.titre,
    produitSlug: product.slug,
    format: format.trim(),
    options,
    quantite: quantity,
    prixUnitaire: price,
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
