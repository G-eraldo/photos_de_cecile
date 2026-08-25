<script setup>
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
</script>

<template>
  <Card class="max-w-5xl mx-auto p-4 md:p-6 mt-12">
    <CardTitle class="text-2xl font-bold mb-4 text-[#613213] text-center md:text-left">
      Tirages de Photos
    </CardTitle>
    <div class="flex flex-col md:flex-row gap-6">
      <CardContent class="w-full md:w-1/2 text-[#9e8b8b] leading-8 font-playfair md:py-8 text-base md:text-lg">
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          Chaque photographie raconte une histoire unique.
        </p>
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          C'est pourquoi vous trouverez une variété de formats pour vos
          tirages, allant des petites impressions (idéales pour les albums)
          aux grands formats (qui sauront habiller vos murs avec élégance).
        </p>
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          Les tirages sont réalisés avec des matériaux de haute qualité,
          garantissant une durabilité et une fidélité des couleurs qui
          mettront en valeur vos souvenirs pour les années à venir.
        </p>
      </CardContent>
      <div class="w-full md:w-1/2 aspect-3/4 md:aspect-4/3 overflow-hidden">
        <NuxtImg class="w-full h-full object-cover rounded-lg shadow-2xl" src="/images/cta.png" alt="un chien" />
      </div>
    </div>
    <CardFooter class="flex justify-center">
      <Button as-child class="items-center">
        <NuxtLink to="/tirages-photo">Développer vos photos</NuxtLink>
      </Button>
    </CardFooter>
  </Card>
</template>
