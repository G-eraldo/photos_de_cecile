<script setup>
import Accueil from '~/components/accueil/Accueil.vue';
import Avis from '~/components/accueil/Avis.vue';
import Cta from '~/components/accueil/Cta.vue';
import Instagram from '~/components/accueil/Instagram.vue';
import { SITE_PREPARATION } from '~/utils/site-preparation';

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Photographe à Amiens',
  description: 'Les Photos de Cécile, photographe à Amiens : grossesse, naissance, famille, couple, mariage, baptême et animaux, en lumière naturelle.',
})
</script>

<template>
  <SitePreparationScreen v-if="SITE_PREPARATION" />
  <div v-else>
    <Accueil />
    <Cta />
    <Instagram />
    <Avis />
  </div>
</template>
