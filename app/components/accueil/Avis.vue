<script setup>
import { nextTick, onMounted, ref } from 'vue'

const consent = useCookie('cecile_reviews_consent', {
    default: () => 'pending',
    maxAge: 180 * 24 * 60 * 60,
    sameSite: 'lax',
    secure: true,
})
const reviewsEnabled = ref(false)

async function enableReviews() {
    reviewsEnabled.value = true
    await nextTick()

    const existingScript = document.querySelector(
        'script[src="https://static.elfsight.com/platform/platform.js"]'
    )

    if (!existingScript) {
        const script = document.createElement('script')

        script.src = 'https://static.elfsight.com/platform/platform.js'
        script.async = true

        document.head.appendChild(script)
    }
}

function acceptReviews() {
    consent.value = 'accepted'
    enableReviews()
}

function rejectReviews() {
    consent.value = 'rejected'
}

onMounted(() => {
    if (consent.value === 'accepted') enableReviews()
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

            <div v-if="reviewsEnabled" class="elfsight-app-0326db88-58c9-43ed-96ae-19c0ac181935" data-elfsight-app-lazy />
            <div v-else-if="consent !== 'rejected'" class="mx-auto max-w-xl rounded-2xl bg-white/70 px-6 py-8 text-center shadow-sm">
                <p class="text-sm leading-6 text-[#676463]">
                    Les avis sont fournis par un service tiers. En les affichant, vous autorisez le chargement de ce service.
                </p>
                <div class="mt-5 flex flex-wrap justify-center gap-3">
                    <button type="button" class="rounded-full bg-[#5A3419] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#382b27]" @click="acceptReviews">Accepter et afficher les avis</button>
                    <button type="button" class="rounded-full border border-[#9e8b8b] px-5 py-3 text-sm font-medium text-[#5A3419] transition hover:bg-white" @click="rejectReviews">Refuser</button>
                </div>
            </div>
            <div v-else class="mx-auto max-w-xl rounded-2xl bg-white/70 px-6 py-8 text-center shadow-sm">
                <p class="text-sm leading-6 text-[#676463]">Les avis tiers ne sont pas affichés, conformément à votre choix.</p>
                <button type="button" class="mt-5 text-sm font-medium text-[#5A3419] underline" @click="consent = 'pending'">Modifier mon choix</button>
            </div>

        </div>

    </section>
</template>
