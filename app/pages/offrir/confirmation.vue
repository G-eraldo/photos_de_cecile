<script setup>
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock3, XCircle } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Confirmation de votre bon cadeau',
  description: 'Confirmation du paiement de votre bon cadeau.',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const reference = computed(() => typeof route.query.reference === 'string' ? route.query.reference : '')
const { data, pending, error, refresh } = await useAsyncData(
  () => `gift-payment-${reference.value}`,
  () => $fetch('/api/payments/mollie/status', { query: { reference: reference.value } }),
)
const isConfirmed = computed(() => data.value?.type === 'commande' && data.value?.statut === 'paye')
const isFailed = computed(() => ['echoue', 'expire', 'annule'].includes(data.value?.statut))
let refreshTimer
let redirectTimer
let stopConfirmationWatch

onMounted(() => {
  refreshTimer = window.setInterval(() => {
    if (data.value?.statut === 'en_attente') refresh()
  }, 3000)
  stopConfirmationWatch = watch(isConfirmed, (confirmed) => {
    if (confirmed) redirectTimer = window.setTimeout(() => navigateTo('/offrir'), 7000)
  }, { immediate: true })
})

onBeforeUnmount(() => {
  window.clearInterval(refreshTimer)
  window.clearTimeout(redirectTimer)
  stopConfirmationWatch?.()
})
</script>

<template>
  <Card class="mx-auto mt-32 max-w-xl p-6 text-center">
    <div v-if="pending" class="py-8 text-[#9e8b8b]">Vérification de votre paiement…</div>
    <div v-else-if="error" class="py-8 text-red-600">Impossible de retrouver ce bon cadeau.</div>
    <div v-else-if="isConfirmed" class="space-y-4 py-4">
      <CheckCircle2 class="mx-auto h-12 w-12 text-green-600" />
      <CardTitle class="font-playfair text-2xl text-[#613213]">Votre bon cadeau est confirmé</CardTitle>
      <CardDescription>Votre paiement a été reçu. Une confirmation vient de vous être envoyée par e-mail.</CardDescription>
      <p class="text-sm text-[#9e8b8b]">Redirection vers les bons cadeaux dans quelques secondes…</p>
      <Button as-child variant="outline"><NuxtLink to="/offrir">Revenir aux bons cadeaux</NuxtLink></Button>
    </div>
    <div v-else-if="isFailed" class="space-y-4 py-4">
      <XCircle class="mx-auto h-12 w-12 text-red-600" />
      <CardTitle class="font-playfair text-2xl text-[#613213]">Le paiement n’a pas abouti</CardTitle>
      <CardDescription>Votre bon cadeau n’est pas confirmé. Vous pouvez recommencer votre commande.</CardDescription>
      <Button as-child><NuxtLink to="/offrir">Revenir aux bons cadeaux</NuxtLink></Button>
    </div>
    <div v-else class="space-y-4 py-4">
      <Clock3 class="mx-auto h-12 w-12 text-[#C9A227]" />
      <CardTitle class="font-playfair text-2xl text-[#613213]">Paiement en cours de confirmation</CardTitle>
      <CardDescription>Nous confirmons votre paiement. Cette page se mettra à jour automatiquement.</CardDescription>
    </div>
  </Card>
</template>
