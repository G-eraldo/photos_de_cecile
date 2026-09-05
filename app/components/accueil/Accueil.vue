<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const currentSlide = ref(0)
const isPaused = ref(false)

const slides = [
  {
    src: 'https://media-photodececile.lafabriqueducode.fr/7_74ede68670.png',
    alt: 'Photographie Les photos de Cécile'
  },
  {
    src: 'https://media-photodececile.lafabriqueducode.fr/9_211d3a83ac.png',
    alt: 'Photographie Les photos de Cécile'
  },
  {
    src: 'https://media-photodececile.lafabriqueducode.fr/1_e1d5cd0f04.png',
    alt: 'Photographie Les photos de Cécile'
  }
]

let autoplay = null

const nextSlide = () => {
  currentSlide.value =
    (currentSlide.value + 1) % slides.length
}

const previousSlide = () => {
  currentSlide.value =
    (currentSlide.value - 1 + slides.length) % slides.length
}

const goToSlide = (index) => {
  currentSlide.value = index
}

const startAutoplay = () => {
  if (autoplay) {
    clearInterval(autoplay)
  }

  autoplay = setInterval(() => {
    if (!isPaused.value) {
      nextSlide()
    }
  }, 6000)
}

const pauseAutoplay = () => {
  isPaused.value = true
}

const resumeAutoplay = () => {
  isPaused.value = false
}

let touchStartX = null

const handleTouchStart = (event) => {
  touchStartX = event.touches[0].clientX
}

const handleTouchEnd = (event) => {
  if (touchStartX === null) {
    return
  }

  const touchEndX = event.changedTouches[0].clientX
  const difference = touchEndX - touchStartX

  if (Math.abs(difference) > 40) {
    if (difference < 0) {
      nextSlide()
    } else {
      previousSlide()
    }
  }

  touchStartX = null
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  if (autoplay) {
    clearInterval(autoplay)
  }
})
</script>

<template>
  <div>

    <!-- HERO -->
    <section
      class="relative isolate flex min-h-[82vh] items-center justify-center overflow-hidden px-8 py-16 text-center"
      data-scroll-reveal-skip
      @mouseenter="pauseAutoplay" @mouseleave="resumeAutoplay" @touchstart.passive="handleTouchStart"
      @touchend.passive="handleTouchEnd">

      <!-- Slides -->
      <div class="absolute inset-0 -z-20">

        <div v-for="(slide, index) in slides" :key="slide.src"
          class="absolute inset-0 transition-all duration-1400 ease-in-out" :class="currentSlide === index
            ? 'z-10 scale-100 opacity-100'
            : 'z-0 scale-[1.08] opacity-0'
            ">

          <NuxtImg :src="slide.src" :alt="slide.alt" class="h-full w-full object-cover" />

          <div class="absolute inset-0 bg-linear-to-b from-[rgba(70,48,38,0.20)] to-[rgba(45,32,26,0.55)]" />
        </div>

      </div>

      <!-- Flèche précédente -->
      <!-- <button type="button" aria-label="Photo précédente"
        class="absolute left-6 top-1/2 z-20 flex h-11.5 w-11.5 -translate-y-1/2 items-center justify-center border border-white/35 bg-[#333333]/55 text-2xl text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white hover:bg-[#333333]/75 max-sm:left-3 max-sm:h-9.5 max-sm:w-9.5"
        @click="previousSlide(); startAutoplay()">
        ‹
      </button> -->

      <!-- Texte -->
      <div class="relative z-20">

        <p
          class="max-w-195 translate-y-0 font-playfair text-[clamp(1.6rem,3.4vw,2.5rem)] font-normal leading-[1.4] text-white opacity-100">
          « La photographie est l'art de montrer de combien d'instants
          éphémères la vie est faite »

          <cite class="mt-5.5 block font-playfair text-[clamp(1.2rem,2vw,1.5rem)] not-italic">
            Marcel Proust
          </cite>
        </p>

      </div>

      <!-- Flèche suivante -->
      <!-- <button type="button" aria-label="Photo suivante"
        class="absolute right-6 top-1/2 z-20 flex h-11.5 w-11.5 -translate-y-1/2 items-center justify-center border border-white/35 bg-[#333333]/55 text-2xl text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white hover:bg-[#333333]/75 max-sm:right-3 max-sm:h-9.5 max-sm:w-9.5"
        @click="nextSlide(); startAutoplay()">
        ›
      </button> -->

      <!-- Dots -->
      <div class="absolute bottom-6.5 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">

        <button v-for="(_, index) in slides" :key="index" type="button" :aria-label="`Afficher la photo ${index + 1}`"
          class="h-2 cursor-pointer rounded-full bg-white/40 transition-all duration-300" :class="currentSlide === index
            ? 'w-5.5 bg-white'
            : 'w-2'
            " @click="goToSlide(index); startAutoplay()" />

      </div>

    </section>


    <!-- BIENVENUE -->
    <section class="bg-white px-8 py-22.5 text-center md:py-25">

      <div class="mx-auto max-w-295">

        <h2 class="font-playfair text-[clamp(2.1rem,4.4vw,3rem)] font-semibold tracking-[0.01em] text-[#5A3419]">
          Bienvenue
        </h2>

        <div class="mx-auto my-5 h-px w-17.5 bg-[#D9D2CF]" />

        <p class="mx-auto mb-4 max-w-160 text-[1.15rem] leading-[1.65] text-[#5A3419]">
          Immortalisons ensemble les moments précieux de votre vie
          avec authenticité et passion.
        </p>

        <p class="mx-auto max-w-160 text-[1.15rem] leading-[1.65] text-[#5A3419]">
          Située à Amiens, je capture votre quotidien au naturel
          pour des souvenirs intemporels.
        </p>

      </div>

    </section>


    <!-- QUI SUIS-JE -->
    <section class="bg-[#E6DFDD] px-8 py-22.5 text-center md:py-25">

      <div class="mx-auto max-w-295">

        <h2 class="mb-7.5 font-playfair text-[clamp(2rem,3.6vw,2.6rem)] font-semibold text-[#5A3419]">
          Qui suis-je ?
        </h2>

        <div class="mx-auto my-5 h-px w-17.5 bg-[#676463]" />
        <div class="mx-auto max-w-190 text-[1.1rem] leading-[1.85] text-[#676463]">

          <p class="mb-5">
            Je suis une photographe qui se déplace chez vous pour réaliser
            des séances en intérieur ou en extérieur dans notre belle région
            Picarde. Ma passion est de transformer vos moments de vie en
            souvenirs inoubliables.
          </p>

          <p class="mb-5">
            Je crois en la beauté de l'authenticité et m'efforce de raconter
            votre histoire à travers des images sincères.
          </p>

          <p>
            Que ce soit pour des portraits de famille, des photos de naissance,
            de grossesse, de vos animaux de compagnie, mais aussi de mariage
            ou bien encore tout simplement des instants de vie du quotidien,
            je vous offrirai un service chaleureux et sur-mesure.
          </p>

        </div>

        <NuxtLink to="/portfolio"
          class="mt-10 inline-block bg-[#676463] px-8.5 py-3.5 text-[0.9rem] tracking-wider text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5A3419]">
          Découvrir quelques photos
        </NuxtLink>

      </div>

    </section>

  </div>
</template>
