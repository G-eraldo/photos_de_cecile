import { randomUUID } from 'node:crypto'

import { createMolliePayment, createStoredOrder, findProductForOrder, getMollieConfig, updateStoredOrder } from '../../../utils/mollie.js'
import { inspectPrivateUpload, verifyPrivateUploadToken } from '../../../utils/r2-private.js'
import { enforceRateLimit, enforceTrustedOrigin } from '../../../utils/request-security.js'

const isText = (value, maximum = 500) => typeof value === 'string' && value.trim() && value.trim().length <= maximum

const validateCartItem = async (config, item) => {
  const format = item?.format || ''
  const options = item?.options
  const quantity = Number(item?.quantity)
  if (!isText(format) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || !options || Array.isArray(options) || typeof options !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Un tirage du panier est invalide.' })
  }

  const product = await findProductForOrder(config, { productId: item?.productId, slug: item?.slug })
  const availableFormats = product.tarifs_formats || product.formats || []
  if (!availableFormats.some((entry) => typeof entry === 'string' ? entry === format.trim() : entry?.format === format.trim())) {
    throw createError({ statusCode: 400, statusMessage: 'Le format sélectionné est invalide.' })
  }
  for (const [name, selected] of Object.entries(options)) {
    if (!Array.isArray(product.options?.[name]) || !product.options[name].includes(selected)) {
      throw createError({ statusCode: 400, statusMessage: 'Une option de tirage est invalide.' })
    }
  }
  if (Object.keys(product.options || {}).some((name) => !Object.hasOwn(options, name))) {
    throw createError({ statusCode: 400, statusMessage: 'Merci de sélectionner toutes les options de tirage.' })
  }

  const photo = await inspectPrivateUpload(verifyPrivateUploadToken(item?.uploadToken))
  const tariff = Array.isArray(product.tarifs_formats) ? product.tarifs_formats.find((entry) => entry?.format === format.trim()) : null
  const formatPrice = Number(tariff?.prix ?? product.prix_a_partir_de)
  const hasFringedEdges = Object.entries(options).some(([name, value]) => /bord|finition/i.test(name) && /frang/i.test(String(value)))
  const fringeFee = hasFringedEdges ? Number(product.supplement_bords_franges ?? 1) : 0
  const deliveryFee = Number(product.supplement_courrier ?? 5)
  if (!Number.isFinite(formatPrice) || formatPrice < 0 || !Number.isFinite(fringeFee) || fringeFee < 0 || !Number.isFinite(deliveryFee) || deliveryFee < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Le tarif du tirage est invalide.' })
  }

  return {
    product: product.titre,
    productSlug: product.slug,
    format: format.trim(),
    options,
    quantity,
    unitPrice: Number((formatPrice + fringeFee).toFixed(2)),
    deliveryFee,
    photo,
  }
}

export default defineEventHandler(async (event) => {
  enforceTrustedOrigin(event)
  enforceRateLimit(event, { scope: 'order-payment', limit: 5, windowMs: 15 * 60 * 1000 })

  const body = await readBody(event)
  const nom = body?.nom || ''
  const prenom = body?.prenom || ''
  const email = body?.email || ''
  const adresse = body?.adresse || ''
  const items = body?.items

  if (![nom, prenom, email, adresse].every((field) => isText(field)) || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    throw createError({ statusCode: 400, statusMessage: 'Merci de renseigner vos coordonnées et l’adresse de livraison.' })
  }
  if (body?.delivery !== 'courrier') {
    throw createError({ statusCode: 400, statusMessage: 'Les tirages sont expédiés uniquement par courrier.' })
  }
  if (!Array.isArray(items) || !items.length || items.length > 20) {
    throw createError({ statusCode: 400, statusMessage: 'Le panier est invalide.' })
  }

  const config = getMollieConfig()
  const validatedItems = await Promise.all(items.map((item) => validateCartItem(config, item)))
  const quantity = validatedItems.reduce((total, item) => total + item.quantity, 0)
  if (quantity > 20) throw createError({ statusCode: 400, statusMessage: 'Le panier ne peut pas contenir plus de 20 tirages.' })

  const subtotal = Number(validatedItems.reduce((total, item) => total + (item.unitPrice * item.quantity), 0).toFixed(2))
  const deliveryFee = Math.max(...validatedItems.map((item) => item.deliveryFee))
  const total = Number((subtotal + deliveryFee).toFixed(2))
  const reference = `c${randomUUID().replace(/-/g, '')}`
  const orderDetails = {
    nom: nom.trim(),
    prenom: prenom.trim(),
    email: email.trim(),
    adresse: adresse.trim(),
    produit: validatedItems.length === 1 ? validatedItems[0].product : `${quantity} tirages photo`,
    produitSlug: validatedItems.length === 1 ? validatedItems[0].productSlug : 'panier-tirages',
    format: validatedItems.length === 1 ? validatedItems[0].format : 'Commande groupée',
    options: { réception: `Par courrier (+${deliveryFee.toFixed(2)} €)` },
    quantite: quantity,
    prixUnitaire: validatedItems.length === 1 ? validatedItems[0].unitPrice : subtotal,
    fraisLivraison: deliveryFee,
    items: validatedItems.map(({ photo, ...item }) => ({ ...item, photoNom: photo.filename })),
  }
  const order = await createStoredOrder(config, {
    reference,
    details: orderDetails,
    montant_total: total,
    mollie_payment_id: `pending_${reference}`,
    statut: 'en_attente',
    photo_privee: validatedItems.map((item) => item.photo),
  })

  try {
    const payment = await createMolliePayment(config, {
      amount: total.toFixed(2),
      reference,
      description: `Commande — ${quantity} tirage${quantity > 1 ? 's' : ''}`,
      confirmationPath: '/tirages-photo/confirmation',
      paymentType: 'commande',
    })
    await updateStoredOrder(config, order.data.documentId, { mollie_payment_id: payment.id })
    return { checkoutUrl: payment._links.checkout.href }
  } catch (error) {
    await updateStoredOrder(config, order.data.documentId, { statut: 'echoue' })
    throw error
  }
})
