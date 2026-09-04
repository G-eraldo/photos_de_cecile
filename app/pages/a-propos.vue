<script setup>
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'À propos',
  description: 'Découvrez Cécile, photographe professionnelle à Amiens, et son approche sensible de la photographie.',
})

import ProposContent from '~/components/propos/ProposContent.vue';
import MapContent from '~/components/propos/MapContent.vue';
</script>

<template>
  <div>
    <ProposContent />
    <MapContent />
  </div>
</template>
