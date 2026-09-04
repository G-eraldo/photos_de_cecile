export const useReviewsConsent = () => {
  const consent = useCookie('cecile_reviews_consent', {
    default: () => 'pending',
    maxAge: 180 * 24 * 60 * 60,
    sameSite: 'lax',
    secure: true,
  })

  return {
    consent,
    acceptReviews: () => { consent.value = 'accepted' },
    rejectReviews: () => { consent.value = 'rejected' },
  }
}
