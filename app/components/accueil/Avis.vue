<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'

const { consent } = useReviewsConsent()
const reviewsEnabled = ref(false)
const reviewsLoadFailed = ref(false)
const reviewsHost = ref(null)
const widgetClass = 'elfsight-app-0326db88-58c9-43ed-96ae-19c0ac181935'

async function enableReviews() {
    if (reviewsEnabled.value) return

    reviewsEnabled.value = true
    await nextTick()

    if (!reviewsHost.value) return

    // Elfsight recommande, pour une SPA, de monter le script et son bloc à
    // l’emplacement exact du widget. Cela force le scan après le consentement.
    const script = document.createElement('script')
    const widget = document.createElement('div')

    script.src = 'https://elfsightcdn.com/platform.js'
    script.async = true
    script.onerror = () => { reviewsLoadFailed.value = true }
    widget.className = widgetClass

    reviewsHost.value.replaceChildren(script, widget)
}

onMounted(() => {
    watch(consent, (value) => {
        if (value === 'accepted') enableReviews()
    }, { immediate: true })
})
</script>

<template>
    <section class="bg-[#E6DFDD] px-8 py-22.5 md:py-25">

        <div class="mx-auto max-w-295">

            <div class="mb-10 text-center">

                <p class="mb-2 font-playfair text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#5A3419]">
                    Témoignages
                </p>

                <h2 class="font-playfair text-[clamp(2rem,3.6vw,2.6rem)] font-semibold text-[#5A3419]">
                    Les avis de mes clients
                </h2>

            </div>

            <div v-if="reviewsEnabled && !reviewsLoadFailed" ref="reviewsHost" class="min-h-24" />
            <p v-else-if="reviewsLoadFailed" class="text-center text-sm leading-6 text-[#676463]">Les avis sont momentanément indisponibles.</p>
            <p v-else-if="consent === 'rejected'" class="text-center text-sm leading-6 text-[#676463]">Les avis tiers ne sont pas affichés, conformément à votre choix.</p>

        </div>

    </section>
</template>
