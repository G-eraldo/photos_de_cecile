<script setup>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingBag } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import EditorialPageHeader from '~/components/EditorialPageHeader.vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const { find } = useStrapi()
const cart = useCartStore()

const fallbackProducts = {
  'tirage-fine-art': {
    titre: 'Tirage Fine Art',
    accroche: 'Un papier d’art à la texture douce, pour des images qui traversent le temps.',
    prix_a_partir_de: 8,
    tarifs_formats: [
      { format: '10 × 10 cm', prix: 3 }, { format: '10 × 15 cm', prix: 3 },
      { format: '13 × 18 cm', prix: 4 }, { format: '15 × 15 cm', prix: 4 },
      { format: '20 × 20 cm', prix: 10 }, { format: '18 × 24 cm', prix: 10 },
      { format: 'A4', prix: 10 }, { format: '20 × 30 cm', prix: 10 }, { format: 'A3', prix: 20 },
    ],
    supplement_bords_franges: 1,
    supplement_courrier: 5,
    imageUrl: '/images/impression.png',
    galerieUrls: ['/images/impression.png', '/images/format.png'],
    caracteristiques: [
      { texte: 'Papier d’art soigneusement sélectionné' },
      { texte: 'Rendu mat et profond' },
      { texte: 'Impression réalisée avec soin' },
    ],
    formats: ['10 × 10 cm', '10 × 15 cm', '13 × 18 cm', '15 × 15 cm', '20 × 20 cm', '18 × 24 cm', 'A4', '20 × 30 cm', 'A3'],
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
    fields: ['titre', 'slug', 'accroche', 'description', 'prix_a_partir_de', 'tarifs_formats', 'supplement_bords_franges', 'supplement_courrier', 'formats', 'options'],
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
    tarifsFormats: Array.isArray(source.tarifs_formats) ? source.tarifs_formats.filter((item) => item?.format && Number.isFinite(Number(item.prix))) : [],
    formats: Array.isArray(source.tarifs_formats) && source.tarifs_formats.length ? source.tarifs_formats.map((item) => item.format) : (source.formats || []),
    options: source.options || {},
    supplementBordsFranges: Number(source.supplement_bords_franges ?? 1),
    supplementCourrier: Number(source.supplement_courrier ?? 5),
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
const photo = ref(null)
const addingToCart = ref(false)

const selectedFormatPrice = computed(() => {
  const tariff = product.value?.tarifsFormats.find((item) => item.format === selectedFormat.value)
  return Number(tariff?.prix ?? product.value?.prix_a_partir_de ?? 0)
})

const hasFringedEdges = computed(() => Object.entries(selectedOptions.value).some(([name, value]) =>
  /bord|finition/i.test(name) && /frang/i.test(String(value)),
))

const unitPrice = computed(() => Number((selectedFormatPrice.value
  + (hasFringedEdges.value ? product.value?.supplementBordsFranges || 0 : 0)).toFixed(2)))

function formatPrice(value) {
  return Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

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

async function addToCart() {
  if (!photo.value) {
    toast.error('Ajoutez la photo à imprimer avant de poursuivre.')
    return
  }

  addingToCart.value = true
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

    cart.addItem({
      productId: product.value.documentId || product.value.id || '',
      slug: product.value.slug || route.params.slug,
      titre: product.value.titre,
      imageUrl: product.value.imageUrl,
      format: selectedFormat.value,
      options: { ...selectedOptions.value },
      quantity: quantity.value,
      unitPrice: unitPrice.value,
      supplementCourrier: product.value.supplementCourrier,
      photo: { filename: photo.value.name, uploadToken: signedUpload.uploadToken },
    })
    photo.value = null
    toast.success('Le tirage a été ajouté au panier.')
  } catch (error) {
    toast.error(error?.data?.statusMessage || error?.statusMessage || error?.message || 'Une erreur est survenue. Veuillez réessayer.')
  } finally {
    addingToCart.value = false
  }
}
</script>

<template>
  <main class="mt-20 min-h-screen bg-[#E6DFDD] pb-20 pt-10 text-[#503d30] sm:mt-24 sm:pt-16">
    <EditorialPageHeader v-if="product" eyebrow="La boutique — Les Photos de Cécile" :title="product.titre"
      :description="product.accroche" />
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
    <div v-else-if="product" class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
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

        <div class="max-w-xl p-7! lg:pt-4!">
          <p class="font-playfair text-2xl text-[#613213] md:text-3xl">{{ formatPrice(unitPrice) }} €</p>
          <p class="mt-1 text-xs text-[#806957]">Prix unitaire selon le format et les finitions choisies.</p>
          <p class="mt-8 leading-7 text-[#6d5b4e]">{{ product.description || product.accroche }}</p>

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
          <div class="mt-10 border-t border-[#d8cec1] pt-8">
            <h2 class="font-playfair text-2xl">Ajouter votre tirage au panier</h2>
            <p class="mt-2 text-sm leading-6 text-[#6d5b4e]">Importez la photo à imprimer. Vous pourrez réunir vos tirages et finaliser la commande depuis le panier.</p>
            <div class="mt-4 grid gap-2"><Label for="order-photo">Photo à imprimer</Label><Input id="order-photo"
                type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                @change="selectPhoto" />
              <p class="text-xs text-[#806957]">JPG, PNG, WebP ou HEIC. Votre photo est envoyée directement dans un
                espace Cloudflare privé.</p>
            </div>
            <Button type="button" class="mt-6 w-full" :disabled="addingToCart" @click="addToCart">
              <ShoppingBag class="mr-2 h-4 w-4" />
              {{ addingToCart ? 'Ajout en cours…' : `Ajouter au panier — ${formatPrice(unitPrice * quantity)} €` }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
