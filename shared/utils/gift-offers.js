const giftOffers = [
  { value: 'animaux', label: 'Animaux', choices: [{ photos: 5, price: 110 }, { photos: 10, price: 185 }, { photos: 15, price: 230 }] },
  { value: 'famille', label: 'Famille, couple, grossesse, portrait ou boudoir', choices: [{ photos: 10, price: 185 }, { photos: 15, price: 230 }] },
  { value: 'naissance', label: 'Naissance', choices: [{ photos: 10, price: 250 }, { photos: 15, price: 295 }] },
]

export const promotionStart = Date.parse('2026-11-21T00:00:00+01:00')
export const promotionEnd = Date.parse('2026-11-23T00:00:00+01:00')

export function getGiftOffers(now = Date.now()) {
  if (now < promotionStart || now >= promotionEnd) return giftOffers

  return giftOffers.map((offer) => {
    if (!['animaux', 'famille'].includes(offer.value)) return offer
    return {
      ...offer,
      choices: offer.choices.map((choice) => choice.photos === 15
        ? { ...choice, regularPrice: choice.price, price: 185 }
        : choice),
    }
  })
}
