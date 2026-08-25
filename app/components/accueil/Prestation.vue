<script setup>
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
</script>

<template>
  <Card class="max-w-5xl mx-auto p-4 md:p-6 mt-12">
    <CardTitle class="text-2xl font-bold mb-4 text-[#613213]">
      Prestations
    </CardTitle>
    <div class="flex flex-col lg:flex-row gap-6">
      <div class="w-full lg:w-1/2 aspect-3/4 md:aspect-4/3 lg:aspect-video overflow-hidden">
        <NuxtImg class="w-full h-full object-cover object-top rounded-lg mt-5 shadow-2xl" src="/images/prestation.png"
          alt="Séance de bain thérapeutique pour bébé" />
      </div>
      <CardContent class="w-full lg:w-1/2 text-[#9e8b8b] leading-8 font-playfair py-4 md:py-8 text-base md:text-lg">
        <CardTitle
          class="text-base md:text-2xl font-bold mb-4 text-[#613213] w-full whitespace-nowrap overflow-hidden text-ellipsis">
          Bain thérapeutique photographié
        </CardTitle>
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          La séance se déroule à Rivery avec Hyn'Odysée bien naître et dure
          environ 1h30 parfois plus selon bébé.
        </p>
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          Le bain thérapeutique est un soin qui permet au bébé de retrouver
          les sensations connues de sa vie intra-utérine. Emmailloté dans une
          eau chaude, il est libre de ses mouvements et retrouve le bien-être
          du ventre maternel.
        </p>
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          Plongé dans ses souvenirs, le retrait du lange représente pour lui
          le moment de la naissance. Il refait le passage entre les deux
          mondes plus en douceur. Ce bain permet parfois de libérer des
          émotions pour le bébé et pour la maman, surtout lorsque
          l'accouchement n'est pas celui qui était souhaité...
        </p>
        <p class="hover:text-[#613213] transition-colors duration-300 mb-5 text-justify">
          C'est Hélène qui s'occupera de réaliser le bain thérapeutique. Elle
          est auxiliaire de puériculture en maternité et s'est formée à
          l'école du bien naître de Sonia Krief.
        </p>
      </CardContent>
    </div>
    <CardFooter class="flex justify-center">
      <Button as-child class="items-center">
        <NuxtLink to="/prestations">Découvrir toutes nos prestations</NuxtLink>
      </Button>
    </CardFooter>
  </Card>
</template>
