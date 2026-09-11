<script setup>
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';
import ReservationForm from '~/components/ReservationForm.vue';

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Réserver une séance',
  description: 'Réservez une séance photo à Amiens : choisissez la formule, le lieu et un créneau, puis réglez l’acompte en ligne.',
})
</script>

<template>

  <div>
    <EditorialPhotoBanner
      src="https://media-photodececile.lafabriqueducode.fr/Marron_Rouge_Photo_Photo_Noel_Bien_etre_Carte_Cadeau_Banniere_moyenne_US_Paysage_5f578a8553.jpg"
      alt="Séance photo en extérieur au coucher du soleil, près d’Amiens" position="center 52%" />

    <EditorialPageHeader title="Réservation"
      description="Choisissez votre séance et le moment qui vous convient pour créer vos souvenirs." />
    <ReservationForm />
  </div>
</template>
