<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
// presta is auto-imported from utils/dataPresta.js in Nuxt 4, but we can also import it if needed:
// import { presta } from '~/utils/dataPresta';

const api = ref();

const setApi = (val) => {
  api.value = val;
};

let autoplayInterval;

onMounted(() => {
  // Simple autoplay implementation since shadcn-vue carousel api exposes scrollNext
  autoplayInterval = setInterval(() => {
    if (api.value) {
      api.value.scrollNext();
    }
  }, 3000);
});

onUnmounted(() => {
  if (autoplayInterval) clearInterval(autoplayInterval);
});
</script>

<template>
  <Card class="max-w-5xl mx-auto p-4 md:p-6 mt-32">
    <CardTitle class="text-2xl font-bold mb-4 text-[#613213]">
      Bienvenue
    </CardTitle>
    <div class="flex flex-col md:flex-row gap-6">
      <div class="md:w-1/2 aspect-3/4 md:aspect-video overflow-hidden">
        <div class="relative w-full h-full md:pt-10">
          <Carousel class="w-full h-full" @init-api="setApi" :opts="{
            align: 'start',
            loop: true,
          }">
            <CarouselContent class="h-full">
              <CarouselItem v-for="src in presta" :key="src.id" class="h-full">
                <div class="w-full h-full">
                  <NuxtImg class="w-full h-full object-cover rounded-lg" :src="src.src" alt="Photo de prestation" />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious
              class="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white z-10" />
            <CarouselNext
              class="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white z-10" />
          </Carousel>
        </div>
      </div>
      <CardContent class="w-full md:w-1/2 text-[#9e8b8b] leading-8 font-playfair py-4 md:py-8 text-base md:text-lg">
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          Immortalisons ensemble les moments précieux de votre vie avec
          authenticité et passion. Située à Amiens, je capture votre quotidien
          au naturel pour des souvenirs intemporels.
        </p>
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          Je suis une photographe qui se déplace chez vous pour réaliser des
          séances en intérieur ou en extérieur dans notre belle région
          Picarde. Ma passion est de transformer vos moments de vie en
          souvenirs inoubliables.
        </p>
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          Je crois en la beauté de l'authenticité et m'efforce de raconter
          votre histoire à travers des images sincères.
        </p>
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          Que ce soit pour des portraits de famille, des photos de naissance,
          de grossesse, de vos animaux de compagnie, mais aussi de mariage ou
          bien encore tout simplement des instants de vie du quotidien, je
          vous offrirai un service chaleureux et sur-mesure.
        </p>
      </CardContent>
    </div>
  </Card>
</template>
