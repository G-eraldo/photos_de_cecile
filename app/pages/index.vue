<script setup>
import Accueil from '~/components/accueil/Accueil.vue';
import Avis from '~/components/accueil/Avis.vue';
import Cta from '~/components/accueil/Cta.vue';
import Instagram from '~/components/accueil/Instagram.vue';
import Prestation from '~/components/accueil/Prestation.vue';

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Photographe à Amiens',
  description: 'Les Photos de Cécile, photographe à Amiens : grossesse, naissance, famille, couple, mariage, baptême et animaux.',
  ogTitle: 'Les Photos de Cécile | Photographe à Amiens',
  ogDescription: 'Des moments de vie photographiés avec naturel et sensibilité à Amiens et ses alentours.',
})
</script>

<template>
  <div>
    <Accueil />
    <Cta />
    <Prestation />
    <Instagram />
    <Avis />
  </div>
</template>
