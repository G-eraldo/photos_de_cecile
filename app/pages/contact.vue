<script setup>
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';
import EditorialPhotoBanner from '~/components/EditorialPhotoBanner.vue';
import FormContent from '~/components/FormContent.vue';

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Contact',
  description: 'Contactez Les Photos de Cécile pour organiser votre séance photo à Amiens et ses alentours.',
})
</script>

<template>
  <main class="mt-20 pb-20 pt-10 sm:mt-24 sm:pt-16">
    <EditorialPageHeader title="Contact"
      description="Une envie, une date ou une question ? Échangeons pour imaginer votre séance." />
    <EditorialPhotoBanner src="https://media-photodececile.lafabriqueducode.fr/3_4fa71f2d6a.png"
      alt="Une femme avec son chien et son lapin en extérieur" position="center 48%" />
    <FormContent />
  </main>
</template>
