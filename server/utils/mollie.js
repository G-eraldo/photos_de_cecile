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

  if (!apiKey || !siteUrl || !strapiUrl || !strapiToken) {
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

export const findFormula = async (config, prestationName, formuleName) => {
  const query = new URLSearchParams({
    "filters[nom][$eq]": prestationName,
    "filters[actif][$eq]": "true",
    "fields[0]": "nom",
    "populate[Formule][fields][0]": "nom",
    "populate[Formule][fields][1]": "prix",
    "populate[Formule][fields][2]": "acompte_pourcentage",
  });
  const response = await strapiFetch(config, `/prestations?${query.toString()}`);
  const prestation = response.data?.[0];
  const formule = prestation?.Formule?.find((item) => item.nom === formuleName);

  if (!formule || !Number.isFinite(Number(formule.prix))) {
    throw createError({ statusCode: 400, statusMessage: "La formule sélectionnée est invalide." });
  }

  const percentage = Number(formule.acompte_pourcentage ?? 30);
  if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
    throw createError({ statusCode: 400, statusMessage: "Le montant de l’acompte est invalide." });
  }

  const amount = (Number(formule.prix) * percentage) / 100;
  if (amount < 0.01) {
    throw createError({ statusCode: 400, statusMessage: "Le montant de l’acompte est invalide." });
  }

  return {
    amount: amount.toFixed(2),
    percentage,
    formule,
  };
};

export const getTravelFee = (location) => {
  if (!Object.hasOwn(travelFees, location)) {
    throw createError({ statusCode: 400, statusMessage: "Le lieu de prise de vue est invalide." });
  }

  return travelFees[location];
};

export const createStoredReservation = (config, data) =>
  strapiFetch(config, "/reservations", { method: "POST", body: { data } });

export const updateStoredReservation = (config, documentId, data) =>
  strapiFetch(config, `/reservations/${encodeURIComponent(documentId)}`, {
    method: "PUT",
    body: { data },
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
  const response = await strapiFetch(config, `/reservations?${query.toString()}`);
  return response.data?.[0] || null;
};

export const createMolliePayment = async (config, { amount, reference, description }) => {
  const payment = await $fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: {
      amount: { currency: "EUR", value: amount },
      description,
      redirectUrl: `${config.siteUrl}/reservation/confirmation?reference=${encodeURIComponent(reference)}`,
      webhookUrl: `${config.siteUrl}/api/payments/mollie/webhook`,
      metadata: { reference },
    },
  });

  if (!payment?.id || !payment?._links?.checkout?.href) {
    throw createError({ statusCode: 502, statusMessage: "Impossible de créer le paiement d’acompte." });
  }

  return payment;
};

export const getMolliePayment = (config, paymentId) =>
  $fetch(`${apiUrl}/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
