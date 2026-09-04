<script setup>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mail } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Offrir un bon cadeau | Les Photos de Cécile',
  description: 'Offrez une séance photo et ses souvenirs, avec un bon cadeau personnalisé envoyé par e-mail.',
})

const prestations = [
  { value: 'animaux', label: 'Animaux', choices: [{ photos: 5, price: 110 }, { photos: 10, price: 185 }, { photos: 15, price: 230 }] },
  { value: 'famille', label: 'Famille, couple, grossesse, portrait ou boudoir', choices: [{ photos: 10, price: 185 }, { photos: 15, price: 230 }] },
  { value: 'naissance', label: 'Naissance', choices: [{ photos: 10, price: 250 }, { photos: 15, price: 295 }] },
]
const deliveryChoices = [
  { value: 'email', label: 'Par e-mail', description: 'Le bon cadeau PDF personnalisé est envoyé après paiement.' },
  { value: 'courrier', label: 'Par courrier +5 €', description: 'Cécile préparera votre bon cadeau et vous l’enverra par courrier.' },
]
const hasEmoji = (value) => /[\p{Extended_Pictographic}\p{Regional_Indicator}]/u.test(value)

const selectedPrestation = ref('animaux')
const selectedPhotos = ref(5)
const delivery = ref('email')
const nom = ref('')
const prenom = ref('')
const email = ref('')
const beneficiaire = ref('')
const message = ref('')
const rue = ref('')
const codePostal = ref('')
const ville = ref('')
const paymentPending = ref(false)

const selectedPrestationData = computed(() => prestations.find((prestation) => prestation.value === selectedPrestation.value))
const photoChoices = computed(() => selectedPrestationData.value?.choices || [])
const selectedChoice = computed(() => photoChoices.value.find((choice) => choice.photos === selectedPhotos.value))
const total = computed(() => (selectedChoice.value?.price || 0) + (delivery.value === 'courrier' ? 5 : 0))
const formattedTotal = computed(() => total.value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))

watch(selectedPrestationData, (prestation) => {
  if (prestation && !prestation.choices.some((choice) => choice.photos === selectedPhotos.value)) selectedPhotos.value = prestation.choices[0].photos
})

async function submitGiftCard() {
  if (!nom.value.trim() || !prenom.value.trim() || !email.value.trim() || !beneficiaire.value.trim()) {
    toast.error('Merci de renseigner vos coordonnées et le prénom du bénéficiaire.')
    return
  }
  if (delivery.value === 'courrier' && (!rue.value.trim() || !codePostal.value.trim() || !ville.value.trim())) {
    toast.error('Merci de renseigner l’adresse d’envoi du bon cadeau.')
    return
  }
  if (hasEmoji(message.value)) {
    toast.error('Les emojis ne sont pas autorisés dans le message.')
    return
  }

  paymentPending.value = true
  try {
    const response = await $fetch('/api/payments/mollie/gift', {
      method: 'POST',
      body: {
        nom: nom.value,
        prenom: prenom.value,
        email: email.value,
        beneficiaire: beneficiaire.value,
        message: message.value,
        adresse: delivery.value === 'courrier' ? `${rue.value.trim()}\n${codePostal.value.trim()} ${ville.value.trim()}` : '',
        prestation: selectedPrestation.value,
        photos: selectedPhotos.value,
        delivery: delivery.value,
      },
    })
    if (response.checkoutUrl) return window.location.assign(response.checkoutUrl)
    toast.error('Impossible de créer votre paiement.')
  } catch (error) {
    toast.error(error?.data?.statusMessage || error?.statusMessage || error?.message || 'Une erreur est survenue. Veuillez réessayer.')
  } finally {
    paymentPending.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#E6DFDD] px-6 pb-20 pt-32 text-[#503d30] md:pt-40">
    <div class="mx-auto max-w-6xl">
      <div class="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:gap-18">
        <div class="lg:sticky lg:top-28 lg:self-start">
          <div class="aspect-4/5 overflow-hidden bg-[#ddd4c9] shadow-sm">
            <img src="https://media-photodececile.lafabriqueducode.fr/DSC_06915_ad4aa41b76.jpg"
              alt="Aperçu du bon cadeau personnalisé" width="6336" height="9504" decoding="async"
              class="h-full w-full object-cover" />
          </div>
          <p class="mt-3 text-center text-xs text-[#806957]">
            {{ delivery === 'courrier' ? 'Cécile préparera votre bon cadeau et vous l’enverra par courrier.' : 'Le bon personnalisé sera envoyé au format PDF après paiement.' }}
          </p>
        </div>

        <div class="max-w-xl p-7!">
          <p class="text-xs uppercase tracking-[0.24em] text-[#907762]">La boutique</p>
          <h1 class="mt-3 font-playfair text-4xl leading-tight md:text-5xl">Bon cadeau</h1>
          <p class="mt-4 font-playfair text-xl">À offrir, valable un an</p>
          <p class="mt-8 leading-7 text-[#6d5b4e]">Choisissez une prestation, le forfait photo et ajoutez votre message.
            Le bon cadeau sera complété puis envoyé par e-mail après le paiement.</p>

          <div class="mt-8 border-y border-[#d8cec1] py-7">
            <h2 class="font-playfair text-xl">Pour quelle prestation ?</h2>
            <div class="mt-4 grid gap-2">
              <button v-for="prestation in prestations" :key="prestation.value" type="button"
                class="border p-4 text-left text-sm transition"
                :class="selectedPrestation === prestation.value ? 'border-[#503d30] bg-[#f5eeea]' : 'border-[#b9aa9c] hover:border-[#503d30]'"
                @click="selectedPrestation = prestation.value">
                {{ prestation.label }}
              </button>
            </div>
          </div>

          <div class="mt-8">
            <p class="text-sm font-medium">Forfait</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button v-for="choice in photoChoices" :key="choice.photos" type="button"
                class="rounded-full border px-4 py-2 text-sm transition"
                :class="selectedPhotos === choice.photos ? 'border-[#503d30] bg-[#503d30] text-white' : 'border-[#b9aa9c] hover:border-[#503d30]'"
                @click="selectedPhotos = choice.photos">
                {{ choice.photos }} photos · {{ choice.price }} €
              </button>
            </div>
          </div>

          <div class="mt-6">
            <p class="text-sm font-medium">Réception</p>
            <div class="mt-3 grid gap-2">
              <button v-for="choice in deliveryChoices" :key="choice.value" type="button"
                class="border p-4 text-left transition"
                :class="delivery === choice.value ? 'border-[#503d30] bg-[#f5eeea]' : 'border-[#b9aa9c] hover:border-[#503d30]'"
                @click="delivery = choice.value">
                <span class="block text-sm font-medium">{{ choice.label }}</span><span
                  class="mt-1 block text-xs leading-5 text-[#806957]">{{ choice.description }}</span>
              </button>
            </div>
          </div>

          <form class="mt-10 border-t border-[#d8cec1] pt-8" @submit.prevent="submitGiftCard">
            <h2 class="font-playfair text-2xl">Personnaliser le bon cadeau</h2>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="grid gap-2"><Label for="gift-nom">Votre nom</Label><Input id="gift-nom" v-model="nom"
                  autocomplete="family-name" required /></div>
              <div class="grid gap-2"><Label for="gift-prenom">Votre prénom</Label><Input id="gift-prenom"
                  v-model="prenom" autocomplete="given-name" required /></div>
            </div>
            <div class="mt-4 grid gap-2"><Label for="gift-beneficiaire">Prénom du bénéficiaire</Label><Input
                id="gift-beneficiaire" v-model="beneficiaire" required /></div>
            <div class="mt-4 grid gap-2"><Label for="gift-message">Votre message <span
                  class="text-[#806957]">(facultatif)</span></Label><Textarea id="gift-message" v-model="message"
                :maxlength="250" rows="4" placeholder="Un petit mot pour accompagner ce cadeau…" /></div>
            <div class="mt-4 grid gap-2"><Label for="gift-email">Votre e-mail</Label><Input id="gift-email"
                v-model="email" type="email" autocomplete="email" required /></div>
            <div v-if="delivery === 'courrier'" class="mt-4 grid gap-4 sm:grid-cols-2">
              <div class="grid gap-2 sm:col-span-2"><Label for="gift-rue">Numéro et rue</Label><Input id="gift-rue"
                  v-model="rue" autocomplete="street-address" required /></div>
              <div class="grid gap-2"><Label for="gift-code-postal">Code postal</Label><Input id="gift-code-postal"
                  v-model="codePostal" inputmode="numeric" autocomplete="postal-code" required /></div>
              <div class="grid gap-2"><Label for="gift-ville">Ville</Label><Input id="gift-ville" v-model="ville"
                  autocomplete="address-level2" required /></div>
            </div>
            <Button type="submit" class="mt-6 w-full" :disabled="paymentPending">
              <Mail class="mr-2 h-4 w-4" />{{ paymentPending ? 'Redirection vers le paiement…' : `Payer
              ${formattedTotal} €` }}
            </Button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
