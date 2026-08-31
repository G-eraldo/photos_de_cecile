<script setup>
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

watch(product, (value) => {
  if (!value) return
  selectedImage.value = 0
  selectedFormat.value = value.formats[0] || ''
  selectedOptions.value = Object.fromEntries(Object.entries(value.options).map(([name, choices]) => [name, choices[0]]))
}, { immediate: true })

function decreaseQuantity() {
  quantity.value = Math.max(1, quantity.value - 1)
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
          <button type="button"
            class="mt-8 w-full border border-[#503d30] bg-[#503d30] px-6 py-4 text-sm text-white transition hover:bg-transparent hover:text-[#503d30]">Ajouter
            au panier</button>
          <p class="mt-3 text-center text-xs text-[#806957]">La commande et le téléversement de vos photos seront
            bientôt disponibles.</p>
        </div>
      </div>
    </div>
  </div>
</template>
