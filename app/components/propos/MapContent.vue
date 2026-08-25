<script setup>
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Maps from './Maps.vue';
</script>

<template>
  <Card class="max-w-5xl mx-auto p-4 md:p-8 mt-12 shadow-lg bg-white/90 backdrop-blur-sm">
    <CardTitle class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-[#613213] text-center">
      Envie d'immortaliser vos moments ?
    </CardTitle>
    <div class="flex flex-col md:flex-row gap-8 md:gap-12">
      <div class="w-full md:w-1/2">
        <div class="space-y-6 md:space-y-8 text-[#9e8b8b] text-base md:text-lg">
          <p class="leading-relaxed">
            Contactez-moi dès aujourd'hui pour discuter de vos idées et
            planifier une séance photo qui vous ressemble.
          </p>
          <div class="border-l-4 border-[#613213] pl-4 sm:pl-6 py-2">
            <p class="hover:text-[#613213] transition-colors duration-300 mb-2">
              Localisation
            </p>
            <p class="hover:text-[#613213] transition-colors duration-300 mb-2">
              Les photos de Cécile
            </p>
            <p class="hover:text-[#613213] transition-colors duration-300">
              8 allée sablée 80000 Amiens
            </p>
          </div>
        </div>
      </div>
      <div class="w-full md:w-1/2 space-y-4 md:space-y-6">
        <CardContent class="text-[#9e8b8b] font-playfair text-base md:text-lg">
          <Button as-child class="w-full mt-3">
            <NuxtLink to="/contact" class="w-full text-lg md:text-xl">
              Contactez-moi
            </NuxtLink>
          </Button>
          <div class="mt-4 md:mt-6">
            <ClientOnly>
              <Maps />
            </ClientOnly>
          </div>
        </CardContent>
      </div>
    </div>
  </Card>
</template>
