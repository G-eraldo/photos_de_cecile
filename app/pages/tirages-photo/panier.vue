<script setup>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Minus, Plus, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import EditorialPageHeader from '~/components/EditorialPageHeader.vue'

definePageMeta({ layout: 'default' })

const cart = useCartStore()
const nom = ref('')
const prenom = ref('')
const email = ref('')
const rue = ref('')
const codePostal = ref('')
const ville = ref('')
const paymentPending = ref(false)

const deliveryFee = computed(() => Math.max(0, ...cart.items.map((item) => Number(item.supplementCourrier ?? 5))))
const total = computed(() => Number((cart.subtotal + deliveryFee.value).toFixed(2)))

function formatPrice(value) {
  return Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function checkout() {
  if (cart.isEmpty) return
  if (!nom.value.trim() || !prenom.value.trim() || !email.value.trim() || !rue.value.trim() || !codePostal.value.trim() || !ville.value.trim()) {
    toast.error('Merci de renseigner vos coordonnées et l’adresse de livraison.')
    return
  }

  paymentPending.value = true
  try {
    const response = await $fetch('/api/payments/mollie/order', {
      method: 'POST',
      body: {
        nom: nom.value,
        prenom: prenom.value,
        email: email.value,
        adresse: `${rue.value.trim()}\n${codePostal.value.trim()} ${ville.value.trim()}`,
        delivery: 'courrier',
        items: cart.items.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          format: item.format,
          options: item.options,
          quantity: item.quantity,
          uploadToken: item.photo?.uploadToken,
        })),
      },
    })
    if (!response.checkoutUrl) throw new Error('Impossible de créer votre paiement.')
    window.location.assign(response.checkoutUrl)
  } catch (error) {
    toast.error(error?.data?.statusMessage || error?.statusMessage || error?.message || 'Une erreur est survenue. Veuillez réessayer.')
  } finally {
    paymentPending.value = false
  }
}
</script>

<template>
  <main class="mt-20 min-h-screen bg-[#E6DFDD] pb-20 pt-10 text-[#503d30] sm:mt-24 sm:pt-16">
    <EditorialPageHeader eyebrow="La boutique — Les Photos de Cécile" title="Votre panier"
      description="Vérifiez vos tirages, puis finalisez votre commande en une seule fois." />

    <div v-if="cart.isEmpty" class="mx-auto max-w-2xl px-5 text-center sm:px-8">
      <p class="text-lg text-[#6d5b4e]">Votre panier est vide.</p>
      <Button as-child class="mt-6"><NuxtLink to="/tirages-photo">Découvrir les tirages</NuxtLink></Button>
    </div>

    <div v-else class="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-12">
      <section class="space-y-5">
        <article v-for="item in cart.items" :key="item.id" class="flex gap-4 border-b border-[#d8cec1] pb-5">
          <NuxtImg :src="item.imageUrl" :alt="item.titre" class="h-28 w-22 object-cover" sizes="88px" />
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="font-playfair text-xl">{{ item.titre }}</h2>
                <p class="mt-1 text-sm text-[#6d5b4e]">{{ item.format }} · {{ item.photo?.filename }}</p>
                <p v-if="Object.keys(item.options || {}).length" class="mt-1 text-xs text-[#806957]">{{ Object.entries(item.options).map(([name, value]) => `${name} : ${value}`).join(' · ') }}</p>
              </div>
              <button type="button" class="text-[#806957] hover:text-red-700" :aria-label="`Retirer ${item.titre}`" @click="cart.removeItem(item.id)">
                <Trash2 class="size-4" />
              </button>
            </div>
            <div class="mt-4 flex items-center justify-between gap-4">
              <div class="inline-flex border border-[#a99888]">
                <button type="button" class="px-3 py-1.5 hover:bg-[#ebe4da]" aria-label="Retirer un tirage" @click="cart.updateQuantity(item.id, item.quantity - 1)"><Minus class="size-3" /></button>
                <span class="min-w-9 border-x border-[#a99888] px-3 py-1.5 text-center text-sm">{{ item.quantity }}</span>
                <button type="button" class="px-3 py-1.5 hover:bg-[#ebe4da]" aria-label="Ajouter un tirage" @click="cart.updateQuantity(item.id, item.quantity + 1)"><Plus class="size-3" /></button>
              </div>
              <p class="font-medium">{{ formatPrice(item.unitPrice * item.quantity) }} €</p>
            </div>
          </div>
        </article>
      </section>

      <section class="border border-[#d8cec1] bg-white/55 p-6 sm:p-8">
        <h2 class="font-playfair text-2xl">Finaliser la commande</h2>
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div class="grid gap-2"><Label for="cart-nom">Nom</Label><Input id="cart-nom" v-model="nom" autocomplete="family-name" /></div>
          <div class="grid gap-2"><Label for="cart-prenom">Prénom</Label><Input id="cart-prenom" v-model="prenom" autocomplete="given-name" /></div>
        </div>
        <div class="mt-4 grid gap-2"><Label for="cart-email">E-mail</Label><Input id="cart-email" v-model="email" type="email" autocomplete="email" /></div>
        <p class="mt-6 text-sm text-[#6d5b4e]">Vos tirages seront envoyés par courrier (+{{ formatPrice(deliveryFee) }} €).</p>
        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div class="grid gap-2"><Label for="cart-rue">Numéro et rue</Label><Input id="cart-rue" v-model="rue" autocomplete="street-address" /></div>
          <div class="grid gap-2"><Label for="cart-code-postal">Code postal</Label><Input id="cart-code-postal" v-model="codePostal" inputmode="numeric" autocomplete="postal-code" /></div>
          <div class="grid gap-2"><Label for="cart-ville">Ville</Label><Input id="cart-ville" v-model="ville" autocomplete="address-level2" /></div>
        </div>
        <div class="mt-7 border-t border-[#d8cec1] pt-5 text-sm">
          <p class="flex justify-between"><span>Sous-total</span><span>{{ formatPrice(cart.subtotal) }} €</span></p>
          <p v-if="deliveryFee" class="mt-2 flex justify-between"><span>Envoi par courrier</span><span>{{ formatPrice(deliveryFee) }} €</span></p>
          <p class="mt-4 flex justify-between font-playfair text-xl text-[#613213]"><span>Total</span><span>{{ formatPrice(total) }} €</span></p>
        </div>
        <Button type="button" class="mt-6 w-full" :disabled="paymentPending" @click="checkout">
          {{ paymentPending ? 'Redirection vers le paiement…' : `Payer ${formatPrice(total)} €` }}
        </Button>
      </section>
    </div>
  </main>
</template>
