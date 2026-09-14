<script setup>
import Accueil from '~/components/accueil/Accueil.vue';
import Avis from '~/components/accueil/Avis.vue';
import Cta from '~/components/accueil/Cta.vue';
import Instagram from '~/components/accueil/Instagram.vue';

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Photographe à Amiens',
  description: 'Les Photos de Cécile, photographe à Amiens : grossesse, naissance, famille, couple, mariage, baptême et animaux, en lumière naturelle.',
})
</script>

<template>
  <div>
    <Accueil />
    <Cta />
    <Instagram />
    <Avis />
  </div>
</template>
