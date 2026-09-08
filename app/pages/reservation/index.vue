<script setup>
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';
import ReservationForm from '~/components/ReservationForm.vue';

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Réserver une séance',
  description: 'Choisissez votre formule, votre lieu et votre créneau pour réserver une séance photo.',
})
</script>

<template>

  <main>
    <EditorialPhotoBanner
      src="https://media-photodececile.lafabriqueducode.fr/Marron_Rouge_Photo_Photo_Noel_Bien_etre_Carte_Cadeau_Banniere_moyenne_US_Paysage_5f578a8553.jpg"
      alt="Une femme et son cheval au coucher du soleil" position="center 52%" />

    <EditorialPageHeader title="Réservation"
      description="Choisissez votre séance et le moment qui vous convient pour créer vos souvenirs." />
    <ReservationForm />
  </main>
</template>
