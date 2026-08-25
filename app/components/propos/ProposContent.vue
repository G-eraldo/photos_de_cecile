<script setup>
import { Card, CardContent, CardTitle } from '@/components/ui/card';
</script>

<template>
  <Card class="max-w-5xl mx-auto p-4 md:p-6 mt-32">
    <CardTitle class="text-2xl font-bold mb-4 text-[#613213]">
      Un petit bout de moi
    </CardTitle>
    <div class="flex flex-col md:flex-row gap-6">
      <div class="w-full md:w-1/2 aspect-3/4 md:aspect-video">
        <NuxtImg src="/images/profil.png" class="w-full h-full object-cover object-top rounded-lg shadow-2xl"
          alt="Photo de profil" width="500" height="500" />
      </div>
      <CardContent class="w-full md:w-1/2 text-[#9e8b8b] leading-8 font-playfair py-4 md:py-8 text-base md:text-lg">
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          J'ai commencé à m'intéresser à la photographie à l'âge de 17 ans.
          J'ai passé de nombreuses années à essayer toutes sortes de
          photographies, parfois passant des heures devant une abeille pour
          obtenir LA photo idéale.
        </p>
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          13 ans plus tard, je décide de transformer cette passion en une
          entreprise qui me ressemble, et qui rendra fiers les personnes qui
          m'entourent.
        </p>
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          Ce qui me distingue, c'est la capacité à mettre les clients à l'aise
          et à saisir des instants authentiques et spontanés.
        </p>
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          Que ce soit pour une séance photo de famille, un shooting grossesse
          ou un événement spécial, je m'efforce de refléter la personnalité de
          chacun à travers mon objectif.
        </p>
        <p class="hover:text-[#613213] transition-colors duration-300 text-justify">
          Vos regards et vos émotions sont capturés avec soin et précision.
        </p>
      </CardContent>
    </div>
  </Card>
</template>
