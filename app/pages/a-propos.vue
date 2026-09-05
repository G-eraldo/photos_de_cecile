<script setup>
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';
import MapContent from '~/components/propos/MapContent.vue';
import ProposContent from '~/components/propos/ProposContent.vue';

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'À propos',
  description: 'Découvrez Cécile, photographe professionnelle à Amiens, et son approche sensible de la photographie.',
})
</script>

<template>
  <main class="mt-20 pb-20 pt-10 sm:mt-24 sm:pt-16">
    <EditorialPageHeader title="À propos"
      description="Une photographie sensible et spontanée, au plus près de ce qui vous ressemble." />
    <ProposContent />
    <MapContent />
  </main>
</template>
