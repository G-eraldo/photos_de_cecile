<script setup>
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Réserver une séance | Les Photos de Cécile',
  description: 'Choisissez votre formule, votre lieu et votre créneau pour réserver une séance photo.',
})

import ReservationForm from '~/components/ReservationForm.vue'
import EditorialPageHeader from '~/components/EditorialPageHeader.vue'
</script>

<template>
  <main class="mt-20 pb-20 pt-10 sm:mt-24 sm:pt-16">
    <EditorialPageHeader title="Réservation"
      description="Choisissez votre séance et le moment qui vous convient pour créer vos souvenirs." />
    <ReservationForm />
  </main>
</template>
