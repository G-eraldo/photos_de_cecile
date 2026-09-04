<script setup>
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';

const presta = [
  { name: "10x10 / 10x15", price: "8€" },
  { name: "13x18 / 15x15", price: "10€" },
  { name: "20x20 / 18x24 / A4 / 20x30", price: "17€" },
  { name: "30x30", price: "22€" },
  { name: "30x40", price: "27€" },
];
</script>

<template>
  <Card class="max-w-5xl mx-auto p-4 md:p-6 mt-16 md:mt-15">
    <CardTitle class="text-xl md:text-2xl font-bold mb-4 text-[#613213] font-playfair">
      Des prix pour une impression de qualité
    </CardTitle>
    <CardDescription class="text-[#9e8b8b]">
      Tirage fine art sur papier coton grain + ou grain +++
    </CardDescription>
    <div class="flex flex-col md:flex-row gap-6 mt-6">
      <CardContent class="w-full md:w-1/2 h-75 md:h-125">
        <NuxtImg src="/images/impression.png" class="w-full h-full object-cover object-top rounded-lg"
          alt="Formats disponibles" />
      </CardContent>
      <CardContent class="w-full md:w-1/2">
        <div class="grid gap-4">
          <Card v-for="prestas in presta" :key="prestas.name"
            class="p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-[#f8f4f1]">
            <div class="flex justify-between items-center">
              <div>
                <CardDescription class="mb-1">Format</CardDescription>
                <CardContent class="p-0 font-medium text-[#9e8b8b]">
                  {{ prestas.name }}
                </CardContent>
              </div>
              <div>
                <CardDescription class="mb-1">Prix</CardDescription>
                <CardContent class="p-0 font-medium text-[#9e8b8b]">
                  {{ prestas.price }}
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </div>
    <CardFooter class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <p class="p-0 font-medium text-[#9e8b8b]">
          Vous avez la possibilité de choisir avec ou sans marge.
        </p>
        <p class="p-0 font-medium text-xs text-[#9e8b8b]">
          * Tous les prix sont hors taxes
        </p>
      </div>
      <Button as-child class="text-lg w-full md:w-auto">
        <NuxtLink to="/tirages-photo">Développer vos photos</NuxtLink>
      </Button>
    </CardFooter>
  </Card>
</template>
