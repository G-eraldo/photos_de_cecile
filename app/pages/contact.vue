<script setup>
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';
import EditorialPhotoBanner from '~/components/EditorialPhotoBanner.vue';
import FormContent from '~/components/FormContent.vue';

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Contact',
  description: 'Écrivez à Les Photos de Cécile pour organiser une séance photo à Amiens, en Somme ou en Picardie.',
})
</script>

<template>
  <div class="pb-20">
    <EditorialPhotoBanner src="https://media-photodececile.lafabriqueducode.fr/3_4fa71f2d6a.png"
      alt="Une femme avec son chien et son lapin en extérieur" position="center 48%" />
    <div class="pt-10 sm:pt-16">
      <EditorialPageHeader title="Contact" />
      <FormContent />
    </div>
  </div>
</template>
