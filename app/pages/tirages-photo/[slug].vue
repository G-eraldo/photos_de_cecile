<script setup>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'default' })

const route = useRoute()
const { find } = useStrapi()

const fallbackProducts = {
  'tirage-fine-art': {
    titre: 'Tirage Fine Art',
    accroche: 'Un papier d’art à la texture douce, pour des images qui traversent le temps.',
    prix_a_partir_de: 8,
    imageUrl: '/images/impression.png',
    galerieUrls: ['/images/impression.png', '/images/format.png'],
    caracteristiques: [
      { texte: 'Papier d’art soigneusement sélectionné' },
      { texte: 'Rendu mat et profond' },
      { texte: 'Impression réalisée avec soin' },
    ],
    formats: ['10 × 15 cm', '13 × 18 cm', '15 × 15 cm', '20 × 20 cm', 'A4', '30 × 40 cm'],
    options: { marge: ['Sans marge', 'Avec marge'], finition: ['Bords droits', 'Bords frangés'] },
  },
  'tirage-traditionnel': {
    titre: 'Tirage traditionnel',
    accroche: 'Une impression lumineuse et fidèle pour garder vos instants du quotidien tout près de vous.',
    prix_a_partir_de: 6,
    imageUrl: '/images/format.png',
    galerieUrls: ['/images/format.png', '/images/impression.png'],
    caracteristiques: [{ texte: 'Papier photo traditionnel' }, { texte: 'Couleurs fidèles et durables' }, { texte: 'Plusieurs formats disponibles' }],
    formats: ['10 × 15 cm', '13 × 18 cm', '20 × 30 cm', 'A4'],
    options: { marge: ['Sans marge', 'Avec marge'] },
  },
  'pack-souvenirs': {
    titre: 'Pack souvenirs',
    accroche: 'Une sélection de tirages pensée pour offrir, partager et revivre les moments qui comptent.',
    prix_a_partir_de: 32,
    imageUrl: '/images/cta.png',
    galerieUrls: ['/images/cta.png', '/images/impression.png'],
    caracteristiques: [{ texte: 'Une sélection de tirages variés' }, { texte: 'Idéal à offrir' }, { texte: 'Préparé avec attention' }],
    formats: ['Pack de 10 tirages', 'Pack de 20 tirages'],
    options: {},
  },
}

const { data, pending, error } = await useAsyncData(
  `produit-${route.params.slug}`,
  () => find('produits', {
    fields: ['titre', 'slug', 'accroche', 'description', 'prix_a_partir_de', 'formats', 'options'],
    populate: {
      image: { fields: ['url', 'alternativeText'] },
      galerie: { fields: ['url', 'alternativeText'] },
      caracteristiques: { fields: ['texte', 'ordre'] },
    },
    filters: { slug: { $eq: route.params.slug }, publishedAt: { $notNull: true } },
    pagination: { pageSize: 1 },
  }),
)

const strapiUrl = useRuntimeConfig().public.strapi?.url || useRuntimeConfig().strapi?.url || ''

function mediaUrl(image, fallback) {
  if (!image?.url) return fallback
  return image.url.startsWith('http') ? image.url : `${strapiUrl}${image.url}`
}

const apiProduct = computed(() => {
  const response = data.value?.data || data.value || []
  return Array.isArray(response) ? response[0] : response
})

const product = computed(() => {
  const source = apiProduct.value || fallbackProducts[route.params.slug]
  if (!source) return null

  const gallery = source.galerieUrls || [
    mediaUrl(source.image, '/images/impression.png'),
    ...(source.galerie || []).map((image) => mediaUrl(image, '/images/impression.png')),
  ]

  return {
    ...source,
    imageUrl: source.imageUrl || mediaUrl(source.image, '/images/impression.png'),
    galerieUrls: [...new Set(gallery)],
    prix: Number(source.prix_a_partir_de).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
    formats: source.formats || [],
    options: source.options || {},
  }
})

if (!pending.value && !product.value && !error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Produit introuvable' })
}

useSeoMeta({
  title: () => product.value ? `${product.value.titre} | Les Photos de Cécile` : 'Tirage photo | Les Photos de Cécile',
  description: () => product.value?.accroche || 'Découvrez les tirages photo des Photos de Cécile.',
  ogImage: () => product.value?.imageUrl,
})

const selectedImage = ref(0)
const selectedFormat = ref('')
const selectedOptions = ref({})
const quantity = ref(1)
const nom = ref('')
const prenom = ref('')
const email = ref('')
const rue = ref('')
const codePostal = ref('')
const ville = ref('')
const photo = ref(null)
const paymentPending = ref(false)

watch(product, (value) => {
  if (!value) return
  selectedImage.value = 0
  selectedFormat.value = value.formats[0] || ''
  selectedOptions.value = Object.fromEntries(Object.entries(value.options).map(([name, choices]) => [name, choices[0]]))
}, { immediate: true })

function decreaseQuantity() {
  quantity.value = Math.max(1, quantity.value - 1)
}

function selectPhoto(event) {
  photo.value = event.target.files?.[0] || null
}

async function submitOrder() {
  if (!nom.value.trim() || !prenom.value.trim() || !email.value.trim() || !rue.value.trim() || !codePostal.value.trim() || !ville.value.trim()) {
    toast.error('Merci de renseigner votre nom, prénom, e-mail et adresse postale.')
    return
  }
  if (!photo.value) {
    toast.error('Ajoutez la photo à imprimer avant de poursuivre.')
    return
  }

  paymentPending.value = true
  try {
    const signedUpload = await $fetch('/api/uploads/private/presign', {
      method: 'POST',
      body: { filename: photo.value.name, type: photo.value.type, size: photo.value.size },
    })
    const uploadResponse = await fetch(signedUpload.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': photo.value.type },
      body: photo.value,
    })
    if (!uploadResponse.ok) throw new Error('Le téléversement privé de la photo a échoué.')

    const response = await $fetch('/api/payments/mollie/order', {
      method: 'POST',
      body: {
        nom: nom.value,
        prenom: prenom.value,
        email: email.value,
        adresse: `${rue.value.trim()}\n${codePostal.value.trim()} ${ville.value.trim()}`,
        productId: product.value.documentId || product.value.id || '',
        slug: product.value.slug || route.params.slug,
        format: selectedFormat.value,
        options: selectedOptions.value,
        quantity: quantity.value,
        uploadToken: signedUpload.uploadToken,
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
    <div v-if="pending" class="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
      <Skeleton class="aspect-4/5 rounded-none" />
      <div class="space-y-5">
        <Skeleton class="h-10 w-3/4" />
        <Skeleton class="h-5 w-full" />
        <Skeleton class="h-5 w-5/6" />
        <Skeleton class="h-12 w-full" />
      </div>
    </div>
    <Alert v-else-if="error && !product" variant="destructive" class="mx-auto max-w-2xl">
      <AlertDescription>Ce tirage est momentanément indisponible.</AlertDescription>
    </Alert>
    <div v-else-if="product" class="mx-auto max-w-6xl">
      <NuxtLink to="/tirages-photo" class="mb-8 inline-flex text-sm text-[#806957] transition hover:text-[#503d30]">←
        Retour aux tirages</NuxtLink>
      <div class="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:gap-18">
        <div class="lg:sticky lg:top-28 lg:self-start">
          <div class="aspect-4/5 overflow-hidden bg-[#ddd4c9]">
            <NuxtImg :src="product.galerieUrls[selectedImage]" :alt="product.titre" class="h-full w-full object-cover"
              sizes="sm:100vw lg:55vw" />
          </div>
          <div v-if="product.galerieUrls.length > 1" class="mt-4 flex gap-3">
            <button v-for="(image, index) in product.galerieUrls" :key="image" type="button"
              class="h-20 w-16 overflow-hidden border-2"
              :class="selectedImage === index ? 'border-[#503d30]' : 'border-transparent'"
              :aria-label="`Afficher la photo ${index + 1}`" @click="selectedImage = index">
              <NuxtImg :src="image" :alt="`${product.titre} – vue ${index + 1}`" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>

        <div class="max-w-xl p-7!">
          <p class="text-xs uppercase tracking-[0.24em] text-[#907762]">La boutique</p>
          <h1 class="mt-3 font-playfair text-4xl leading-tight md:text-5xl">{{ product.titre }}</h1>
          <p class="mt-4 font-playfair text-xl">À partir de {{ product.prix }} €</p>
          <p class="mt-1 text-xs text-[#806957]">Frais d’expédition calculés à l’étape de paiement.</p>
          <p class="mt-8 leading-7 text-[#6d5b4e]">{{ product.accroche }}</p>

          <div v-if="product.caracteristiques?.length" class="mt-8 border-y border-[#d8cec1] py-7">
            <h2 class="font-playfair text-xl">Caractéristiques</h2>
            <ul class="mt-4 space-y-2 text-sm leading-6 text-[#6d5b4e]">
              <li v-for="feature in product.caracteristiques" :key="feature.texte" class="flex gap-3"><span
                  aria-hidden="true">•</span><span>{{ feature.texte }}</span></li>
            </ul>
          </div>

          <div v-if="product.formats.length" class="mt-8"><label class="text-sm font-medium">Format</label>
            <div class="mt-3 flex flex-wrap gap-2"><button v-for="format in product.formats" :key="format" type="button"
                class="rounded-full border px-4 py-2 text-sm transition"
                :class="selectedFormat === format ? 'border-[#503d30] bg-[#503d30] text-white' : 'border-[#b9aa9c] hover:border-[#503d30]'"
                @click="selectedFormat = format">{{ format }}</button></div>
          </div>
          <div v-for="(choices, name) in product.options" :key="name" class="mt-6">
            <p class="text-sm font-medium capitalize">{{ name }}</p>
            <div class="mt-3 flex flex-wrap gap-2"><button v-for="choice in choices" :key="choice" type="button"
                class="rounded-full border px-4 py-2 text-sm transition"
                :class="selectedOptions[name] === choice ? 'border-[#503d30] bg-[#503d30] text-white' : 'border-[#b9aa9c] hover:border-[#503d30]'"
                @click="selectedOptions[name] = choice">{{ choice }}</button></div>
          </div>

          <div class="mt-8">
            <p class="text-sm font-medium">Quantité</p>
            <div class="mt-3 inline-flex border border-[#a99888]"><button type="button"
                class="px-4 py-2 hover:bg-[#ebe4da]" aria-label="Retirer un tirage"
                @click="decreaseQuantity">−</button><span
                class="min-w-10 border-x border-[#a99888] px-3 py-2 text-center">{{ quantity }}</span><button
                type="button" class="px-4 py-2 hover:bg-[#ebe4da]" aria-label="Ajouter un tirage"
                @click="quantity += 1">+</button></div>
          </div>
          <form class="mt-10 border-t border-[#d8cec1] pt-8" @submit.prevent="submitOrder">
            <h2 class="font-playfair text-2xl">Commander votre tirage</h2>
            <p class="mt-2 text-sm leading-6 text-[#6d5b4e]">Indiquez vos coordonnées et importez la photo à imprimer.
              Vous serez ensuite redirigé(e) vers le paiement sécurisé.</p>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="grid gap-2"><Label for="order-nom">Nom</Label><Input id="order-nom" v-model="nom"
                  autocomplete="family-name" required /></div>
              <div class="grid gap-2"><Label for="order-prenom">Prénom</Label><Input id="order-prenom" v-model="prenom"
                  autocomplete="given-name" required /></div>
            </div>
            <div class="mt-4 grid gap-2"><Label for="order-email">E-mail</Label><Input id="order-email" v-model="email"
                type="email" autocomplete="email" required /></div>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div class="grid gap-2 sm:col-span-2"><Label for="order-rue">Numéro et rue</Label><Input id="order-rue"
                  v-model="rue" autocomplete="street-address" required /></div>
              <div class="grid gap-2"><Label for="order-code-postal">Code postal</Label><Input id="order-code-postal"
                  v-model="codePostal" inputmode="numeric" autocomplete="postal-code" required /></div>
              <div class="grid gap-2"><Label for="order-ville">Ville</Label><Input id="order-ville" v-model="ville"
                  autocomplete="address-level2" required /></div>
            </div>
            <div class="mt-4 grid gap-2"><Label for="order-photo">Photo à imprimer</Label><Input id="order-photo"
                type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" required
                @change="selectPhoto" />
              <p class="text-xs text-[#806957]">JPG, PNG, WebP ou HEIC. Votre photo est envoyée directement dans un
                espace Cloudflare privé.</p>
            </div>
            <Button type="submit" class="mt-6 w-full" :disabled="paymentPending">
              <Mail class="mr-2 h-4 w-4" />
              {{ paymentPending ? 'Redirection vers le paiement…' : `Payer ${Number(product.prix_a_partir_de *
                quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` }}
            </Button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
