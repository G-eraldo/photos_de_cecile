<script setup>
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';
import EditorialPhotoBanner from '~/components/EditorialPhotoBanner.vue';
import MapContent from '~/components/propos/MapContent.vue';
import ProposContent from '~/components/propos/ProposContent.vue';

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'À propos',
  description: 'Cécile, photographe professionnelle à Amiens : une approche sensible des portraits de famille, naissance, couple et animaux en Picardie.',
})
</script>

<template>
  <div class="pb-20">
    <EditorialPhotoBanner src="https://media-photodececile.lafabriqueducode.fr/1_e1d5cd0f04.png"
      alt="Une femme et son cheval au coucher du soleil" position="center 52%" />
    <div class="pt-10 sm:pt-16">
      <EditorialPageHeader title="À propos" />
      <ProposContent />
      <MapContent />
    </div>
  </div>
</template>
