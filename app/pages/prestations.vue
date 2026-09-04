<script setup>
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Prestations photo à Amiens',
  description: 'Découvrez les prestations photo de Cécile à Amiens : famille, grossesse, naissance, couple, mariage, baptême et animaux.',
})

import Prestation from '~/components/Prestation/Prestation.vue';
</script>

<template>
  <div>
    <Prestation />
  </div>
</template>
