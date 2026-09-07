<script setup>
import { Button } from '@/components/ui/button';
import photos from '~/data/formules-photos.json';
</script>

<template>
  <section class="bg-[#423D31] px-6 py-16 text-[#F2F0EF] sm:px-8 lg:py-24">
    <div class="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
      <div class="max-w-lg">
        <p class="mb-5 text-xs uppercase tracking-[0.24em] text-[#d8c9b7]">Une séance à votre image</p>
        <h2 class="font-playfair text-4xl leading-[1.15] text-[#F2F0EF] sm:text-5xl">
          Découvrez<br class="hidden lg:block"> les formules
        </h2>
        <div class="my-7 h-px w-16 bg-[#d8c9b7]/50" />
        <p class="max-w-md text-base leading-8 text-[#e6ddd3]">
          Vous trouverez tous les renseignements concernant les tarifs
          des différentes prestations dans cette rubrique.
        </p>
        <Button as-child class="mt-8  bg-[#e6dfdd] px-7 py-6 text-[#423D31] hover:bg-white">
          <NuxtLink to="/prestations">Découvrir les tarifs </NuxtLink>
        </Button>
      </div>

      <div aria-label="Des souvenirs avec vos animaux et à deux" class="grid grid-cols-3 items-start gap-2 sm:gap-4">
        <figure v-for="(photo, index) in photos" :key="photo.src"
          :class="['overflow-hidden bg-[#544e41]', index === 1 ? 'mt-10 sm:mt-16' : index === 2 ? 'mt-5 sm:mt-8' : '']">
          <img :src="photo.src" :srcset="photo.srcset" sizes="(min-width: 1280px) 235px, (min-width: 1024px) 19vw, 30vw"
            :width="photo.width" :height="photo.height" :alt="photo.alt" loading="lazy" decoding="async"
            class="block h-auto w-full">
        </figure>
      </div>
    </div>
  </section>
</template>
