<script setup>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gift, Mail } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'default' })

useSeoMeta({
    title: 'Offrir un bon cadeau | Les Photos de Cécile',
    description: 'Offrez un bon cadeau photo, envoyé par e-mail ou par courrier.',
})

const product = {
    titre: 'Bon cadeau',
    accroche: 'Offrez des souvenirs à garder précieusement : un bon cadeau pour choisir ses photos préférées et les faire vivre sur papier.',
    caracteristiques: [
        { texte: 'Valable pour le nombre de photos choisi' },
        { texte: 'Envoyé par e-mail ou joliment préparé par courrier' },
        { texte: 'Option forfait naissance disponible pour 10 ou 15 photos' },
        { texte: "Valabe 1 an à compté de la date d'achat" },
    ],
}

const photoChoices = [
    { value: '5', label: '5 photos', price: 110 },
    { value: '10', label: '10 photos', price: 185 },
    { value: '15', label: '15 photos', price: 230 },
]
const deliveryChoices = [
    { value: 'email', label: 'Par e-mail', description: 'Un bon cadeau dématérialisé, envoyé par e-mail.' },
    { value: 'courrier', label: 'Par courrier +5 €', description: 'Un bon cadeau imprimé, envoyé à l’adresse indiquée.' },
]

const selectedPhotos = ref('5')
const delivery = ref('email')
const birthPackage = ref(false)
const nom = ref('')
const prenom = ref('')
const email = ref('')
const rue = ref('')
const codePostal = ref('')
const ville = ref('')
const paymentPending = ref(false)

const selectedChoice = computed(() => photoChoices.find((choice) => choice.value === selectedPhotos.value))
const canChooseBirthPackage = computed(() => ['10', '15'].includes(selectedPhotos.value))
const total = computed(() => (selectedChoice.value?.price || 0) + (delivery.value === 'courrier' ? 5 : 0) + (birthPackage.value ? 65 : 0))
const formattedTotal = computed(() => total.value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))

watch(canChooseBirthPackage, (allowed) => {
    if (!allowed) birthPackage.value = false
})

async function submitGiftCard() {
    if (!nom.value.trim() || !prenom.value.trim() || !email.value.trim()) {
        toast.error('Merci de renseigner votre nom, prénom et e-mail.')
        return
    }
    if (delivery.value === 'courrier' && (!rue.value.trim() || !codePostal.value.trim() || !ville.value.trim())) {
        toast.error('Merci de renseigner l’adresse d’envoi du bon cadeau.')
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
                adresse: delivery.value === 'courrier' ? `${rue.value.trim()}\n${codePostal.value.trim()} ${ville.value.trim()}` : '',
                photos: selectedPhotos.value,
                delivery: delivery.value,
                birthPackage: birthPackage.value,
            },
        })
        if (response.checkoutUrl) {
            window.location.assign(response.checkoutUrl)
            return
        }
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
                    <div class="flex aspect-4/5 flex-col justify-between bg-[#503d30] p-8 text-[#f7f1ec] md:p-12">
                        <div>
                            <Gift class="h-9 w-9 text-[#dfc5ae]" aria-hidden="true" />
                            <p class="mt-12 text-xs uppercase tracking-[0.28em] text-[#dfc5ae]">Les Photos de Cécile</p>
                            <p class="mt-5 font-playfair text-4xl leading-tight md:text-5xl">Bon cadeau</p>
                        </div>
                        <div class="border-t border-[#927967] pt-5">
                            <p class="font-playfair text-xl">Des souvenirs à choisir, à aimer, à transmettre.</p>
                            <p class="mt-4 text-sm leading-6 text-[#e6d8cd]">Pour {{ selectedChoice?.label }}{{
                                birthPackage ? ' · forfait naissance' : '' }}</p>
                        </div>
                    </div>
                </div>

                <div class="max-w-xl p-7!">
                    <p class="text-xs uppercase tracking-[0.24em] text-[#907762]">La boutique</p>
                    <h1 class="mt-3 font-playfair text-4xl leading-tight md:text-5xl">{{ product.titre }}</h1>
                    <p class="mt-4 font-playfair text-xl">À partir de 110 €</p>
                    <p class="mt-8 leading-7 text-[#6d5b4e]">{{ product.accroche }}</p>

                    <div class="mt-8 border-y border-[#d8cec1] py-7">
                        <h2 class="font-playfair text-xl">Caractéristiques</h2>
                        <ul class="mt-4 space-y-2 text-sm leading-6 text-[#6d5b4e]">
                            <li v-for="feature in product.caracteristiques" :key="feature.texte" class="flex gap-3">
                                <span aria-hidden="true">•</span><span>{{ feature.texte }}</span>
                            </li>
                        </ul>
                    </div>

                    <div class="mt-8">
                        <p class="text-sm font-medium">Nombre de photos</p>
                        <div class="mt-3 flex flex-wrap gap-2">
                            <button v-for="choice in photoChoices" :key="choice.value" type="button"
                                class="rounded-full border px-4 py-2 text-sm transition"
                                :class="selectedPhotos === choice.value ? 'border-[#503d30] bg-[#503d30] text-white' : 'border-[#b9aa9c] hover:border-[#503d30]'"
                                @click="selectedPhotos = choice.value">
                                {{ choice.label }} · {{ choice.price }} €
                            </button>
                        </div>
                    </div>

                    <div class="mt-6">
                        <p class="text-sm font-medium">Réception du bon cadeau</p>
                        <div class="mt-3 grid gap-2">
                            <button v-for="choice in deliveryChoices" :key="choice.value" type="button"
                                class="border p-4 text-left transition"
                                :class="delivery === choice.value ? 'border-[#503d30] bg-[#f5eeea]' : 'border-[#b9aa9c] hover:border-[#503d30]'"
                                @click="delivery = choice.value">
                                <span class="block text-sm font-medium">{{ choice.label }}</span>
                                <span class="mt-1 block text-xs leading-5 text-[#806957]">{{ choice.description
                                    }}</span>
                            </button>
                        </div>
                    </div>

                    <div v-if="canChooseBirthPackage" class="mt-6 border border-[#d8cec1] p-4">
                        <label class="flex cursor-pointer items-start gap-3 text-sm">
                            <input v-model="birthPackage" type="checkbox" class="mt-1 accent-[#503d30]">
                                <span><span class="font-medium">Forfait naissance +65 €</span><span
                                        class="mt-1 block leading-5 text-[#806957]">Disponible avec les bons cadeaux 10
                                        et 15 photos.</span></span>
                        </label>
                    </div>

                    <form class="mt-10 border-t border-[#d8cec1] pt-8" @submit.prevent="submitGiftCard">
                        <h2 class="font-playfair text-2xl">Offrir ce bon cadeau</h2>
                        <p class="mt-2 text-sm leading-6 text-[#6d5b4e]">Vous serez ensuite redirigé(e) vers le paiement
                            sécurisé.</p>
                        <div class="mt-6 grid gap-4 sm:grid-cols-2">
                            <div class="grid gap-2"><Label for="gift-nom">Nom</Label><Input id="gift-nom" v-model="nom"
                                    autocomplete="family-name" required /></div>
                            <div class="grid gap-2"><Label for="gift-prenom">Prénom</Label><Input id="gift-prenom"
                                    v-model="prenom" autocomplete="given-name" required /></div>
                        </div>
                        <div class="mt-4 grid gap-2"><Label for="gift-email">E-mail</Label><Input id="gift-email"
                                v-model="email" type="email" autocomplete="email" required /></div>
                        <div v-if="delivery === 'courrier'" class="mt-4 grid gap-4 sm:grid-cols-2">
                            <div class="grid gap-2 sm:col-span-2"><Label for="gift-rue">Numéro et rue</Label><Input
                                    id="gift-rue" v-model="rue" autocomplete="street-address" required /></div>
                            <div class="grid gap-2"><Label for="gift-code-postal">Code postal</Label><Input
                                    id="gift-code-postal" v-model="codePostal" inputmode="numeric"
                                    autocomplete="postal-code" required /></div>
                            <div class="grid gap-2"><Label for="gift-ville">Ville</Label><Input id="gift-ville"
                                    v-model="ville" autocomplete="address-level2" required /></div>
                        </div>
                        <Button type="submit" class="mt-6 w-full" :disabled="paymentPending">
                            <Mail class="mr-2 h-4 w-4" />
                            {{ paymentPending ? 'Redirection vers le paiement…' : `Payer ${formattedTotal} €` }}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
