export default defineNuxtPlugin((nuxtApp) => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const revealedClass = 'is-scroll-revealed'
  const selector = 'main section, main header, [data-scroll-reveal]'

  const revealImmediately = (element) => {
    element.classList.add(revealedClass)
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return

      revealImmediately(entry.target)
      observer.unobserve(entry.target)
    })
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.08,
  })

  const observe = () => {
    document.querySelectorAll(selector).forEach((element) => {
      if (element.closest('[data-scroll-reveal-skip]') || element.dataset.scrollRevealObserved) {
        return
      }

      element.dataset.scrollRevealObserved = 'true'
      element.setAttribute('data-scroll-reveal', '')

      if (reducedMotion.matches) {
        revealImmediately(element)
        return
      }

      observer.observe(element)
    })
  }

  const updateMotionPreference = () => {
    if (!reducedMotion.matches) return

    document.querySelectorAll('[data-scroll-reveal]').forEach(revealImmediately)
    observer.disconnect()
  }

  nuxtApp.hook('app:mounted', () => {
    document.documentElement.classList.add('scroll-reveal-ready')
    observe()

    const mutations = new MutationObserver(observe)
    mutations.observe(document.body, { childList: true, subtree: true })
    reducedMotion.addEventListener('change', updateMotionPreference)
  })

  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(observe)
  })
})
