export const useReviewsConsent = () => {
  const consent = useCookie('cecile_reviews_consent', {
    default: () => 'pending',
    maxAge: 180 * 24 * 60 * 60,
    sameSite: 'lax',
    secure: true,
  })

  const preferencesOpen = useState('reviews-preferences-open', () => false)
  const setConsent = async (value) => {
    const withdrawing = consent.value === 'accepted' && value === 'rejected'
    consent.value = value
    preferencesOpen.value = false
    if (withdrawing && import.meta.client) {
      await nextTick()
      window.location.reload()
    }
  }

  return {
    consent,
    preferencesOpen,
    openPreferences: () => { preferencesOpen.value = true },
    acceptReviews: () => setConsent('accepted'),
    rejectReviews: () => setConsent('rejected'),
  }
}
