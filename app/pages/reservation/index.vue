<script setup>
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Réserver une séance | Les Photos de Cécile',
  description: 'Choisissez votre formule, votre lieu et votre créneau pour réserver une séance photo.',
})

import ReservationForm from '~/components/ReservationForm.vue'
</script>

<template>
  <ReservationForm />
</template>
