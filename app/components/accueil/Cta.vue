<script setup>
import { Button } from '@/components/ui/button';
</script>

<template>
  <section class="bg-[#423D31] px-6 py-14 sm:px-8 lg:py-16">
    <div
      class="mx-auto grid max-w-295 items-center gap-10 md:grid-cols-[18rem_minmax(0,1fr)] md:gap-16 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-24">
      <div class="mx-auto w-full max-w-72 lg:max-w-80">
        <img src="https://media-photodececile.lafabriqueducode.fr/photo_illu_8680d7d338.jpg"
          alt="Une enfant et son cheval sous les fleurs roses" width="1200" height="1800" loading="lazy"
          decoding="async" class="block aspect-2/3 w-full rounded-t-[999px] object-cover" />
      </div>

      <div class="text-center md:text-left">
        <h2 class="font-playfair text-3xl leading-tight text-[#F2F0EF] sm:text-4xl">
          Découvrez les formules
        </h2>
        <div class="mx-auto my-6 h-px w-16 bg-[#9E8B8B] md:mx-0" />
        <p class="mx-auto max-w-xl text-base leading-7 text-[#F2F0EF] md:mx-0">
          Vous trouverez tous les renseignements concernant les tarifs
          des différentes prestations dans cette rubrique.
        </p>
        <Button as-child class="mt-8 bg-[#9E8B8B] px-7 py-6 text-white hover:bg-[#5A3419]">
          <NuxtLink to="/prestations">Tarifs</NuxtLink>
        </Button>
      </div>
    </div>
  </section>
</template>
