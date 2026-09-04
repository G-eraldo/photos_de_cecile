<script setup>
import { Button } from '@/components/ui/button'

const { consent, acceptReviews, rejectReviews } = useReviewsConsent()
</script>

<template>
  <div v-if="consent === 'pending'" class="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6">
    <section aria-label="Choix de confidentialité" class="mx-auto max-w-4xl rounded-2xl border border-[#d9d2cf] bg-white p-5 shadow-2xl md:flex md:items-center md:gap-8 md:p-6">
      <div class="grow">
        <p class="font-playfair text-xl text-[#5A3419]">Vos préférences de confidentialité</p>
        <p class="mt-2 text-sm leading-6 text-[#676463]">
          Avec votre accord, nous chargeons le service tiers qui affiche les avis clients. Vous pouvez refuser sans incidence sur votre visite.
          <NuxtLink to="/politique-confidentialite" class="font-medium text-[#5A3419] underline underline-offset-2">En savoir plus</NuxtLink>
        </p>
      </div>
      <div class="mt-5 flex shrink-0 flex-wrap gap-3 md:mt-0">
        <Button type="button" variant="outline" class="border-[#9e8b8b] text-[#5A3419]" @click="rejectReviews">Refuser</Button>
        <Button type="button" class="bg-[#5A3419] hover:bg-[#382b27]" @click="acceptReviews">Accepter</Button>
      </div>
    </section>
  </div>
</template>
