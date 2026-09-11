const apiUrl = "https://api.mollie.com/v2/payments";

const travelFees = {
  amiens: 0,
  "bois-creuse": 5,
  "etang-barrette": 15,
  "fort-mahon": 50,
  ruines: 30,
  lille: 75,
  paris: 75,
  rouen: 75,
  "st-quentin": 75,
  autre: 0,
};

const getConfig = () => {
  const apiKey = process.env.MOLLIE_API_KEY;
  const siteUrl = process.env.SITE_URL;
  const strapiUrl = process.env.STRAPI_URL;
  const strapiToken = process.env.STRAPI_API_TOKEN;
  const operationsSecret = process.env.PAYMENT_OPERATIONS_SECRET;

  if (
    !apiKey ||
    !siteUrl ||
    !strapiUrl ||
    !strapiToken ||
    !operationsSecret ||
    operationsSecret.length < 32
  ) {
    throw createError({
      statusCode: 503,
      statusMessage: "Le paiement n’est pas encore configuré.",
    });
  }

  return {
    apiKey,
    siteUrl: siteUrl.replace(/\/$/, ""),
    strapiUrl: strapiUrl.replace(/\/$/, ""),
    strapiToken,
    operationsSecret,
  };
};

const strapiFetch = async (config, path, options = {}) =>
  $fetch(`${config.strapiUrl}/api${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.strapiToken}`,
      ...options.headers,
    },
  });

export const getMollieConfig = getConfig;

const sameText = (first, second) =>
  typeof first === "string" &&
  typeof second === "string" &&
  first.trim().localeCompare(second.trim(), "fr", { sensitivity: "base" }) ===
    0;

export const findFormula = async (
  config,
  { prestationId, prestationName, formuleId, formuleName },
) => {
  const query = new URLSearchParams({
    "filters[actif][$eq]": "true",
    "fields[0]": "nom",
    "fields[1]": "documentId",
    "populate[Formule][fields][0]": "nom",
    "populate[Formule][fields][1]": "prix",
    "populate[Formule][fields][2]": "acompte_pourcentage",
    "populate[Formule][fields][3]": "id",
    "pagination[pageSize]": "1",
  });

  if (typeof prestationId === "string" && prestationId.trim()) {
    query.set("filters[documentId][$eq]", prestationId.trim());
  } else if (
    typeof prestationId === "number" &&
    Number.isInteger(prestationId)
  ) {
    query.set("filters[id][$eq]", String(prestationId));
  } else {
    query.set("filters[nom][$eq]", prestationName);
  }

  const response = await strapiFetch(
    config,
    `/prestations?${query.toString()}`,
  );
  const prestation = response.data?.[0];
  const formule = prestation?.Formule?.find((item) => {
    if (typeof formuleId === "number" && Number.isInteger(formuleId)) {
      return item.id === formuleId;
    }

    return sameText(item.nom, formuleName);
  });

  if (!formule || !Number.isFinite(Number(formule.prix))) {
    throw createError({
      statusCode: 400,
      statusMessage: "La formule sélectionnée est invalide.",
    });
  }

  const percentage = Number(formule.acompte_pourcentage ?? 30);
  if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: "Le montant de l’acompte est invalide.",
    });
  }

  const amount = (Number(formule.prix) * percentage) / 100;
  if (amount < 0.01) {
    throw createError({
      statusCode: 400,
      statusMessage: "Le montant de l’acompte est invalide.",
    });
  }

  return {
    amount: amount.toFixed(2),
    percentage,
    formule,
    prestation,
  };
};

export const getTravelFee = (location) => {
  if (!Object.hasOwn(travelFees, location)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Le lieu de prise de vue est invalide.",
    });
  }

  return travelFees[location];
};

export const paymentOperation = (config, body) =>
  $fetch(`${config.strapiUrl}/api/payment-operations`, {
    method: "POST",
    headers: { "x-payment-operations-secret": config.operationsSecret },
    body,
  });

export const createStoredReservation = (config, data, slot) =>
  paymentOperation(config, {
    operation: "hold",
    type: "reservation",
    data,
    slot,
  });

export const createStoredOrder = (config, data) =>
  strapiFetch(config, "/commandes", { method: "POST", body: { data } });

export const updateStoredReservation = (config, documentId, data) =>
  paymentOperation(config, {
    operation: "update",
    type: "reservation",
    documentId,
    patch: data,
  });

export const updateStoredOrder = (config, documentId, data) =>
  paymentOperation(config, {
    operation: "update",
    type: "commande",
    documentId,
    patch: data,
  });

export const findStoredReservation = async (config, field, value) => {
  const query = new URLSearchParams({
    [`filters[${field}][$eq]`]: value,
    "fields[0]": "reference",
    "fields[1]": "montant_acompte",
    "fields[2]": "mollie_payment_id",
    "fields[3]": "statut",
    "fields[4]": "details",
    "pagination[pageSize]": "1",
  });
  const response = await strapiFetch(
    config,
    `/reservations?${query.toString()}`,
  );
  return response.data?.[0] || null;
};

export const findStoredOrder = async (config, field, value) => {
  const query = new URLSearchParams({
    [`filters[${field}][$eq]`]: value,
    "fields[0]": "reference",
    "fields[1]": "montant_total",
    "fields[2]": "mollie_payment_id",
    "fields[3]": "statut",
    "fields[4]": "details",
    "fields[5]": "photo_privee",
    "pagination[pageSize]": "1",
  });
  const response = await strapiFetch(config, `/commandes?${query.toString()}`);
  return response.data?.[0] || null;
};

export const findProductForOrder = async (config, { productId, slug }) => {
  const query = new URLSearchParams({
    "fields[0]": "titre",
    "fields[1]": "slug",
    "fields[2]": "prix_a_partir_de",
    "fields[3]": "tarifs_formats",
    "fields[4]": "supplement_bords_franges",
    "fields[5]": "supplement_courrier",
    "fields[6]": "formats",
    "fields[7]": "options",
    "filters[publishedAt][$notNull]": "true",
    "pagination[pageSize]": "1",
  });

  if (typeof productId === "string" && productId.trim()) {
    query.set("filters[documentId][$eq]", productId.trim());
  } else if (typeof productId === "number" && Number.isInteger(productId)) {
    query.set("filters[id][$eq]", String(productId));
  } else if (typeof slug === "string" && slug.trim()) {
    query.set("filters[slug][$eq]", slug.trim());
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: "Produit de tirage invalide.",
    });
  }

  const response = await strapiFetch(config, `/produits?${query.toString()}`);
  const product = response.data?.[0];
  if (!product || !Number.isFinite(Number(product.prix_a_partir_de))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ce tirage n’est plus disponible.",
    });
  }
  return product;
};

export const createMolliePayment = async (
  config,
  {
    amount,
    reference,
    description,
    confirmationPath = "/reservation/confirmation",
    paymentType = "reservation",
  },
) => {
  const payment = await $fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Idempotency-Key": `checkout-${reference}`,
    },
    body: {
      amount: { currency: "EUR", value: amount },
      description,
      redirectUrl: `${config.siteUrl}${confirmationPath}?reference=${encodeURIComponent(reference)}`,
      webhookUrl: `${config.siteUrl}/api/payments/mollie/webhook`,
      metadata: { reference, type: paymentType },
    },
  });

  const checkoutUrl = payment?._links?.checkout?.href;
  if (
    !payment?.id ||
    !/^https:\/\/([a-z0-9-]+\.)*mollie\.com(\/|$)/i.test(checkoutUrl || "")
  ) {
    throw createError({
      statusCode: 502,
      statusMessage: "Impossible de créer le paiement d’acompte.",
    });
  }

  return payment;
};

export const listActiveReservationHolds = async (config) => {
  const holds = [];
  const now = Date.now();
  for (let start = 0; ; start += 100) {
    const query = new URLSearchParams({
      "fields[0]": "details",
      "fields[1]": "statut",
      "filters[statut][$in][0]": "en_attente",
      "filters[statut][$in][1]": "paye",
      "pagination[start]": String(start),
      "pagination[limit]": "100",
    });
    const response = await strapiFetch(config, `/reservations?${query}`);
    const rows = response.data || [];
    for (const row of rows) {
      const hold = row.details?.reservationHold;
      if (!hold?.start || !hold?.end) continue;
      if (row.statut !== "paye" && Date.parse(hold.expiresAt) <= now) continue;
      const from = new Date(hold.start);
      const to = new Date(hold.end);
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()))
        holds.push({ start: from, end: to });
    }
    if (rows.length < 100) break;
  }
  return holds;
};

export const getMolliePayment = (config, paymentId) =>
  $fetch(`${apiUrl}/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });

export const listPaymentsForReconciliation = (config, type, start, limit) => {
  const query = new URLSearchParams({
    "fields[0]": "reference",
    "fields[1]": "details",
    "fields[2]": "statut",
    "fields[3]": "mollie_payment_id",
    "fields[4]": type === "commande" ? "montant_total" : "montant_acompte",
    ...(type === "commande" ? { "fields[5]": "photo_privee" } : {}),
    "sort[0]": "id:asc",
    "pagination[start]": String(start),
    "pagination[limit]": String(limit),
  });
  return strapiFetch(
    config,
    `/${type === "commande" ? "commandes" : "reservations"}?${query}`,
  );
};

export const refundUnavailableReservation = async (config, record) => {
  const url = `${apiUrl}/${encodeURIComponent(record.mollie_payment_id)}/refunds`;
  const description = `Créneau indisponible — ${record.reference}`;
  const existing = await $fetch(url, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  const previous = existing?._embedded?.refunds?.find(
    (refund) =>
      refund.description === description &&
      !["failed", "canceled"].includes(refund.status),
  );
  if (previous) return previous;
  return $fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Idempotency-Key": `slot-refund-${record.reference}`,
    },
    body: {
      amount: {
        currency: "EUR",
        value: Number(record.montant_acompte).toFixed(2),
      },
      description,
    },
  });
};
