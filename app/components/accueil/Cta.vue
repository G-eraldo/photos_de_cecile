<script setup>
import { Button } from '@/components/ui/button';
</script>

<template>
  <section class="relative bg-[#423D31] px-6 py-14 text-center text-[#F2F0EF] sm:px-8 lg:py-24">
    <div class="mx-auto max-w-lg lg:max-w-[44%]">
      <h2 class="font-playfair text-3xl leading-tight text-[#F2F0EF] sm:text-4xl">
        Découvrez les formules
      </h2>
      <div class="mx-auto my-6 h-px w-16 bg-[#d8c9b7]/50" />
      <p class="mx-auto max-w-lg text-base leading-7 text-[#e6ddd3]">
        Vous trouverez tous les renseignements concernant les tarifs
        des différentes prestations dans cette rubrique.
      </p>
      <Button as-child class="mt-8">
        <NuxtLink to="/prestations">Tarifs</NuxtLink>
      </Button>
    </div>

    <div class="mx-auto mt-10 grid max-w-lg grid-cols-2 items-start gap-5 lg:mt-0 lg:max-w-none">
      <img src="https://media-photodececile.lafabriqueducode.fr/DSC_08160_e6d3a9b14c.jpg"
        alt="Un chien avec son jouet dans un champ de coquelicots" loading="lazy" decoding="async"
        class="block aspect-2/3 w-full object-cover lg:absolute lg:-top-28 lg:left-[5%] lg:w-[15%]" />
      <img src="https://media-photodececile.lafabriqueducode.fr/photo_illu_8680d7d338.jpg"
        alt="Une femme et son cheval sous les fleurs roses" loading="lazy" decoding="async"
        class="mt-8 block aspect-2/3 w-full object-cover lg:absolute lg:-bottom-32 lg:right-[3%] lg:z-10 lg:mt-0 lg:w-[17%]" />
    </div>
  </section>
</template>
