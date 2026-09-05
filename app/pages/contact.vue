<script setup>
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Contact',
  description: 'Contactez Les Photos de Cécile pour organiser votre séance photo à Amiens et ses alentours.',
})

import FormContent from '~/components/FormContent.vue';
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';
</script>

<template>
  <main class="mt-20 pb-20 pt-10 sm:mt-24 sm:pt-16">
    <EditorialPageHeader title="Contact"
      description="Une envie, une date ou une question ? Échangeons pour imaginer votre séance." />
    <FormContent />
  </main>
</template>
