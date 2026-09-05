<script setup>
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';
import EditorialPhotoBanner from '~/components/EditorialPhotoBanner.vue';
import Prestation from '~/components/Prestation/Prestation.vue';

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Prestations photo à Amiens',
  description: 'Découvrez les prestations photo de Cécile à Amiens : famille, grossesse, naissance, couple, mariage, baptême et animaux.',
})
</script>

<template>
  <main class="pb-20">
    <EditorialPhotoBanner src="https://media-photodececile.lafabriqueducode.fr/9_527dd9e794.png"
      alt="Un couple attendant un enfant dans un champ au coucher du soleil" position="" />
    <div class="pt-10 sm:pt-16">
      <EditorialPageHeader title="Prestations"
        description="Des séances pensées pour raconter vos liens, vos instants et les plus beaux moment de votre vie." />
      <Prestation />
    </div>
  </main>
</template>
