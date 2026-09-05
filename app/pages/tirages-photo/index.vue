<script setup>
import TirageProductCard from '~/components/tirage/TirageProductCard.vue'
import Card from '~/components/ui/card/Card.vue'
import EditorialPageHeader from '~/components/EditorialPageHeader.vue'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Tirages photo | Les Photos de Cécile',
  description: 'Des tirages photo d’art, choisis avec soin pour faire vivre vos souvenirs.',
  ogTitle: 'Tirages photo | Les Photos de Cécile',
  ogDescription: 'Des souvenirs à toucher, à offrir et à transmettre.',
})

const { find } = useStrapi()

const fallbackProducts = [
  { titre: 'Tirage Fine Art', slug: 'tirage-fine-art', prix: '8', imageUrl: '/images/impression.png' },
  { titre: 'Tirage traditionnel', slug: 'tirage-traditionnel', prix: '6', imageUrl: '/images/format.png' },
  { titre: 'Pack souvenirs', slug: 'pack-souvenirs', prix: '32', imageUrl: '/images/cta.png' },
]

const { data, pending, error } = await useAsyncData('produits-tirages', () =>
  find('produits', {
    fields: ['titre', 'slug', 'accroche', 'prix_a_partir_de', 'ordre', 'mis_en_avant'],
    populate: { image: { fields: ['url', 'alternativeText'] } },
    filters: { publishedAt: { $notNull: true } },
    pagination: { pageSize: 24 },
    sort: ['ordre:asc', 'titre:asc'],
  }),
)

const strapiUrl = useRuntimeConfig().public.strapi?.url || useRuntimeConfig().strapi?.url || ''

function mediaUrl(image, fallback) {
  if (!image?.url) return fallback
  return image.url.startsWith('http') ? image.url : `${strapiUrl}${image.url}`
}

const products = computed(() => {
  const entries = data.value?.data || data.value || []
  if (!entries.length) return fallbackProducts

  return entries.map((product) => ({
    ...product,
    prix: Number(product.prix_a_partir_de).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
    imageUrl: mediaUrl(product.image, '/images/impression.png'),
  }))
})
</script>

<template>
  <main class="mt-20 overflow-hidden text-[#503d30] sm:mt-24">
    <section class="pb-16 pt-10 sm:pt-16 md:pb-24">
      <EditorialPageHeader eyebrow="La boutique — Les Photos de Cécile" title="Tirages photo"
        description="Des souvenirs choisis avec soin, à toucher, à offrir et à transmettre." />
      <div class="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-20">
        <div class="order-2 md:order-1">
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#9e8b8b]">Les souvenirs prennent vie</p>
          <h2 class="max-w-lg font-playfair text-4xl leading-[1.08] text-[#613213] md:text-5xl">
            Vos photos méritent mieux qu’un écran.
          </h2>
          <p class="mt-7 max-w-md leading-7 text-[#6d5b4e]">
            Découvrez une sélection de tirages imaginés pour donner une place particulière à vos instants précieux : des
            papiers choisis, une finition délicate et un rendu intemporel.
          </p>
          <a href="#collection"
            class="mt-8 inline-flex border border-[#806957] px-6 py-3 text-sm transition hover:bg-[#503d30] hover:text-white">
            Découvrir la collection
          </a>
        </div>
        <div class="order-1 aspect-4/5 overflow-hidden md:order-2">
          <NuxtImg src="https://res.cloudinary.com/dlnbsf2ed/image/upload/v1788510767/impression_gvwwoy.webp"
            alt="Tirages photo sur papier d'art" class="h-full w-full object-cover" sizes="sm:100vw md:50vw" />
        </div>
      </div>
    </section>

    <section id="collection" class="bg-[#413D31] px-6 py-16 md:py-24">
      <div class="mx-auto max-w-6xl">
        <div class="mb-10 max-w-2xl md:mb-14">
          <p class="text-xs uppercase tracking-[0.24em] text-[#d8c9b7]">La collection</p>
          <h2 class="mt-3 font-playfair text-4xl text-[#f7f2eb] md:text-5xl">Le charme du papier</h2>
          <p class="mt-4 leading-7 text-[#e6ddd3]">Du tirage délicat au coffret prêt à offrir, choisissez le support qui
            racontera votre histoire.</p>
        </div>

        <div v-if="pending" class="grid grid-cols-2 gap-5 md:grid-cols-4">
          <Skeleton v-for="item in 4" :key="item" class="aspect-4/5 rounded-none bg-white/15" />
        </div>
        <Alert v-else-if="error" class="border-[#d8c9b7] bg-transparent text-[#f7f2eb]">
          <AlertDescription>La collection est momentanément indisponible. Veuillez réessayer dans un instant.
          </AlertDescription>
        </Alert>
        <div v-else class="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-7 lg:grid-cols-4">
          <TirageProductCard v-for="product in products" :key="product.slug" :product="product" />
        </div>
      </div>
    </section>

    <section class="bg-[#E6DFDD] px-6 py-16 md:py-24">
      <Card class="mx-auto grid max-w-5xl gap-0! overflow-hidden! border-[#d8cec6]! bg-white! p-0! md:grid-cols-2">
        <div class="aspect-square overflow-hidden md:aspect-auto md:h-full">
          <NuxtImg src="https://res.cloudinary.com/dlnbsf2ed/image/upload/v1788510788/format_uj2t7c.webp"
            alt="Détail d'un tirage photo" class="h-full w-full object-cover" sizes="sm:100vw md:50vw" />
        </div>
        <div class="px-7 py-10 md:px-12 md:py-14">
          <p class="text-xs uppercase tracking-[0.24em] text-[#907762]">Un détail qui change tout</p>
          <h2 class="mt-3 font-playfair text-4xl leading-tight md:text-5xl">À toucher, à garder, à transmettre.</h2>
          <p class="mt-6 leading-7 text-[#6d5b4e]">Chaque commande est préparée avec attention. Le papier, le format et
            les finitions sont là pour que vos photos deviennent de vrais objets de mémoire.</p>
        </div>
      </Card>
    </section>
  </main>
</template>
