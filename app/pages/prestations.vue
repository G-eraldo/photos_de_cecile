<script setup>
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Prestations photo à Amiens',
  description: 'Découvrez les prestations photo de Cécile à Amiens : famille, grossesse, naissance, couple, mariage, baptême et animaux.',
})

import Prestation from '~/components/Prestation/Prestation.vue';
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';
</script>

<template>
  <main class="mt-20 pb-20 pt-10 sm:mt-24 sm:pt-16">
    <EditorialPageHeader title="Prestations"
      description="Des séances pensées pour raconter vos liens, vos instants et les grandes étapes de votre vie." />
    <Prestation />
  </main>
</template>
