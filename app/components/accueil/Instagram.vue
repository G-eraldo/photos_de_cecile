<script setup>
import { Instagram as InstagramIcon } from 'lucide-vue-next';

const instagramUrl = 'https://www.instagram.com/lesphotosdececile80/'

const photos = [
  {
    src: 'https://media-photodececile.lafabriqueducode.fr/5_8bee4ba5a7.png',
    alt: 'Portrait d’une femme avec son cheval sous la lune',
    position: 'object-[center_55%]',
  },
  {
    src: 'https://media-photodececile.lafabriqueducode.fr/9_6c12a7cc2d.png',
    alt: 'Chat gris parmi des tournesols',
    position: 'object-[center_52%]',
  },
  {
    src: 'https://media-photodececile.lafabriqueducode.fr/8_8f656b7dff.png',
    alt: 'Portrait de mariés sous un voile',
    position: 'object-[center_38%]',
  },
]
</script>

<template>
  <section class="px-5 py-14 sm:px-8 sm:py-20">
    <a :href="instagramUrl" target="_blank" rel="noopener noreferrer"
      class="group mx-auto grid max-w-6xl gap-10 bg-white px-7 py-10 shadow-sm transition-shadow duration-300 hover:shadow-lg sm:grid-cols-[minmax(13rem,0.8fr)_1.5fr] sm:items-center sm:gap-12 sm:px-12 sm:py-14 lg:px-16">
      <div class="text-center sm:text-left">
        <p class="font-playfair text-[clamp(2rem,4vw,3.1rem)] leading-tight text-[#5A3419] ">
          Suivez-moi sur
          <span class="block italic"><span class="inline-block border-b border-[#9e8b8b]">Instagram</span></span>
        </p>
        <span
          class="mt-6 inline-flex items-center gap-2  pb-1 text-sm tracking-wide text-[#786b68] transition-colors duration-300 group-hover:text-[#5A3419]">
          <InstagramIcon class="size-4" aria-hidden="true" />
          @lesphotosdececile80
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div v-for="photo in photos" :key="photo.src" class="aspect-square overflow-hidden bg-[#e6dfdd]">
          <img :src="photo.src" :alt="photo.alt" width="900" height="1350" loading="lazy" decoding="async"
            :class="['h-full w-full object-cover transition duration-700 group-hover:scale-105', photo.position]">
        </div>
      </div>
    </a>
  </section>
</template>
