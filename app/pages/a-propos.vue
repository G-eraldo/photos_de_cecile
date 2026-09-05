<script setup>
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';
import EditorialPhotoBanner from '~/components/EditorialPhotoBanner.vue';
import MapContent from '~/components/propos/MapContent.vue';
import ProposContent from '~/components/propos/ProposContent.vue';

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'À propos',
  description: 'Découvrez Cécile, photographe professionnelle à Amiens, et son approche sensible de la photographie.',
})
</script>

<template>
  <main class="pb-20">
    <EditorialPhotoBanner src="https://media-photodececile.lafabriqueducode.fr/1_e1d5cd0f04.png"
      alt="Une femme et son cheval au coucher du soleil" position="center 52%" />
    <div class="pt-10 sm:pt-16">
      <EditorialPageHeader title="À propos"
        description="Une photographie sensible et spontanée, au plus près de ce qui vous ressemble." />
      <ProposContent />
      <MapContent />
    </div>
  </main>
</template>
