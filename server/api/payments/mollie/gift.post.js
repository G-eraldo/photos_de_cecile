import { randomUUID } from 'node:crypto'

import { createMolliePayment, createStoredOrder, getMollieConfig, updateStoredOrder } from '../../../utils/mollie.js'
import { enforceRateLimit, enforceTrustedOrigin } from '../../../utils/request-security.js'

const prices = { 5: 110, 10: 185, 15: 230 }
const isText = (value, maximum = 500) => typeof value === 'string' && value.trim() && value.trim().length <= maximum

export default defineEventHandler(async (event) => {
  enforceTrustedOrigin(event)
  enforceRateLimit(event, { scope: 'gift-payment', limit: 5, windowMs: 15 * 60 * 1000 })

  const details = await readBody(event)
  const nom = details?.nom || ''
  const prenom = details?.prenom || ''
  const email = details?.email || ''
  const adresse = details?.adresse || ''
  const photos = Number(details?.photos)
  const delivery = details?.delivery
  const birthPackage = details?.birthPackage === true

  if (![nom, prenom, email].every((field) => isText(field)) || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    throw createError({ statusCode: 400, statusMessage: 'Merci de renseigner votre nom, prénom et e-mail.' })
  }
  if (!Object.hasOwn(prices, photos)) {
    throw createError({ statusCode: 400, statusMessage: 'Le nombre de photos choisi est invalide.' })
  }
  if (!['email', 'courrier'].includes(delivery)) {
    throw createError({ statusCode: 400, statusMessage: 'Le mode de réception est invalide.' })
  }
  if (delivery === 'courrier' && !isText(adresse)) {
    throw createError({ statusCode: 400, statusMessage: 'L’adresse d’envoi du bon cadeau est requise.' })
  }
  if (birthPackage && ![10, 15].includes(photos)) {
    throw createError({ statusCode: 400, statusMessage: 'Le forfait naissance est disponible pour 10 ou 15 photos.' })
  }

  const total = prices[photos] + (delivery === 'courrier' ? 5 : 0) + (birthPackage ? 65 : 0)
  const reference = `c${randomUUID().replace(/-/g, '')}`
  const orderDetails = {
    type: 'bon_cadeau', nom: nom.trim(), prenom: prenom.trim(), email: email.trim(), adresse: adresse.trim(),
    produit: 'Bon cadeau', produitSlug: 'bon-cadeau', format: `${photos} photos`, quantite: 1, prixUnitaire: prices[photos],
    options: { réception: delivery === 'courrier' ? 'Par courrier (+5 €)' : 'Par e-mail', ...(birthPackage ? { 'forfait naissance': 'Oui (+65 €)' } : {}) },
  }
  const config = getMollieConfig()
  const order = await createStoredOrder(config, {
    reference, details: orderDetails, montant_total: total, mollie_payment_id: `pending_${reference}`, statut: 'en_attente', photo_privee: { type: 'bon_cadeau' },
  })

  try {
    const payment = await createMolliePayment(config, {
      amount: total.toFixed(2), reference, description: `Bon cadeau — ${photos} photos`, confirmationPath: '/offrir/confirmation', paymentType: 'commande',
    })
    await updateStoredOrder(config, order.data.documentId, { mollie_payment_id: payment.id })
    return { checkoutUrl: payment._links.checkout.href }
  } catch (error) {
    await updateStoredOrder(config, order.data.documentId, { statut: 'echoue' })
    throw error
  }
})
