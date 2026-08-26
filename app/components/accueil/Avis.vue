<script setup>
import { onMounted } from 'vue'

onMounted(() => {
    const existingScript = document.querySelector(
        'script[src="https://static.elfsight.com/platform/platform.js"]'
    )

    if (!existingScript) {
        const script = document.createElement('script')

        script.src = 'https://static.elfsight.com/platform/platform.js'
        script.async = true

        document.head.appendChild(script)
    }
})
</script>

<template>
    <section class="bg-[#E6DFDD] px-8 py-22.5 md:py-25">

        <div class="mx-auto max-w-295">

            <div class="mb-10 text-center">

                <p class="mb-2 font-poppins text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#5A3419]">
                    Témoignages
                </p>

                <h2 class="font-playfair text-[clamp(2rem,3.6vw,2.6rem)] font-semibold text-[#5A3419]">
                    Les avis de mes clients
                </h2>

            </div>

            <div class="elfsight-app-0326db88-58c9-43ed-96ae-19c0ac181935" data-elfsight-app-lazy />

        </div>

    </section>
</template>