<script setup>
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock3, XCircle } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Confirmation de commande',
  description: 'Confirmation du paiement de votre commande de tirages photo.',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const reference = computed(() => typeof route.query.reference === 'string' ? route.query.reference : '')
const { data, pending, error, refresh } = await useAsyncData(
  () => `order-payment-${reference.value}`,
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
    if (confirmed) redirectTimer = window.setTimeout(() => navigateTo('/tirages-photo'), 7000)
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
    <div v-else-if="error" class="py-8 text-red-600">Impossible de retrouver cette commande.</div>
    <div v-else-if="isConfirmed" class="space-y-4 py-4">
      <CheckCircle2 class="mx-auto h-12 w-12 text-green-600" />
      <CardTitle class="font-playfair text-2xl text-[#613213]">Votre commande est confirmée</CardTitle>
      <CardDescription>Votre paiement a été reçu. Votre facture vient de vous être envoyée par e-mail et votre tirage
        sera préparé avec soin.</CardDescription>
      <p class="text-sm text-[#9e8b8b]">Redirection vers les tirages dans quelques secondes…</p>
      <Button as-child variant="outline">
        <NuxtLink to="/tirages-photo">Revenir aux tirages</NuxtLink>
      </Button>
    </div>
    <div v-else-if="isFailed" class="space-y-4 py-4">
      <XCircle class="mx-auto h-12 w-12 text-red-600" />
      <CardTitle class="font-playfair text-2xl text-[#613213]">Le paiement n’a pas abouti</CardTitle>
      <CardDescription>Votre commande n’est pas confirmée. Vous pouvez recommencer votre commande.</CardDescription>
      <Button as-child>
        <NuxtLink to="/tirages-photo">Revenir aux tirages</NuxtLink>
      </Button>
    </div>
    <div v-else class="space-y-4 py-4">
      <Clock3 class="mx-auto h-12 w-12 text-[#C9A227]" />
      <CardTitle class="font-playfair text-2xl text-[#613213]">Paiement en cours de confirmation</CardTitle>
      <CardDescription>Nous confirmons votre paiement. Cette page se mettra à jour automatiquement.</CardDescription>
    </div>
  </Card>
</template>
