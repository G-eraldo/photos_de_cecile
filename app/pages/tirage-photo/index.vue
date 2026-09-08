<script setup>
import EditorialPageHeader from '~/components/EditorialPageHeader.vue'
import EditorialPhotoBanner from '~/components/EditorialPhotoBanner.vue'
import TirageProductCard from '~/components/tirage/TirageProductCard.vue'
import Card from '~/components/ui/card/Card.vue'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Tirage photo | Les Photos de Cécile',
  description: 'Des tirages photo d’art, choisis avec soin pour faire vivre vos souvenirs.',
  ogTitle: 'Tirage photo | Les Photos de Cécile',
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
  <main class="overflow-hidden text-[#503d30]">
    <EditorialPhotoBanner src="https://media-photodececile.lafabriqueducode.fr/4_da7bfa672c.png"
      alt="La patte d’un chien reposant dans des mains" position="center 50%" />
    <section class="pb-16 pt-10 sm:pt-16 md:pb-24">
      <EditorialPageHeader eyebrow="La boutique" title="Tirages photo"
        description="Imprimé en France dans mon atelier, sur du papier Français de qualité premium." />
      <div class="mx-auto grid max-w-6xl items-start gap-10 px-6 md:grid-cols-2 md:gap-20 xl:px-0">
        <div class="order-2 md:order-1">
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#9e8b8b]">Vos souvenirs prennent vie</p>
          <h2 class="max-w-lg font-playfair text-4xl leading-[1.08] text-[#613213] md:text-5xl">
            À travers des impressions de qualité et un travail minutieux
          </h2>
          <p class="mt-7 max-w-md leading-7 text-[#6d5b4e]">
            Chaque photographie raconte une histoire unique. C'est pourquoi vous trouverez une variété de formats pour
            vos tirages, allant des petites impressions (idéales pour les albums) aux grands formats (qui sauront
            habiller vos murs avec élégance). Les tirages sont réalisés avec des matériaux de haute qualité,
            garantissant une durabilité et une fidélité des couleurs qui mettront en valeur vos souvenirs pour les
            années à venir.

          </p>
          <a href="#collection"
            class="mt-8 inline-flex border border-[#806957] px-6 py-3 text-sm transition hover:bg-[#503d30] hover:text-white">
            Découvrir la collection
          </a>
        </div>
        <div class="order-1 aspect-4/5 overflow-hidden md:order-2">
          <NuxtImg src="https://media-photodececile.lafabriqueducode.fr/DSC_05692_f1f3b61b6e.jpg"
            alt="Tirages photo sur papier d'art" class="h-full w-full object-cover" sizes="sm:100vw md:50vw" />
        </div>
      </div>
    </section>

    <section id="collection" class="bg-[#413D31] px-6 py-16 md:py-24">
      <div class="mx-auto max-w-6xl">
        <div class="mb-12 md:mb-16">
          <div class="grid gap-6 border-b border-[#d8c9b7]/25 pb-10 md:grid-cols-2 md:items-end md:gap-16 md:pb-12">
            <div>
              <p class="text-xs uppercase tracking-[0.24em] text-[#d8c9b7]">La collection</p>
              <h2 class="mt-4 font-playfair text-4xl leading-tight text-[#f7f2eb] md:text-5xl">Le charme du papier</h2>
            </div>
            <div>
              <p class="text-lg font-medium text-[#f7f2eb]">Deux papiers d’exception pour vos tirages</p>
              <p class="mt-3 text-sm leading-7 text-[#e6ddd3] sm:text-base">
                Pour que chaque image prenne toute sa force, je vous propose deux papiers haut de gamme,
                chacun avec sa personnalité.
              </p>
            </div>
          </div>

          <div class="grid gap-10 py-10 md:grid-cols-2 md:gap-16 md:py-12">
            <article aria-labelledby="papier-coton">
              <p class="text-xs uppercase tracking-[0.2em] text-[#d8c9b7]">Douceur du mat</p>
              <h3 id="papier-coton" class="mt-3 font-playfair text-3xl text-[#f7f2eb]">Papier Coton lisse</h3>
              <p class="mt-5 text-sm leading-7 text-[#e6ddd3] sm:text-base">
                Un papier mat premium qui allie douceur de rendu, noirs intenses et une reproduction des couleurs
                d’une grande fidélité. Idéal pour des images subtiles, des portraits naturels et des tirages
                destinés à être longuement contemplés.
              </p>
            </article>
            <article aria-labelledby="papier-baryte" class="border-t border-[#d8c9b7]/25 pt-10 md:border-t-0 md:pt-0">
              <p class="text-xs uppercase tracking-[0.2em] text-[#d8c9b7]">Profondeur du satiné</p>
              <h3 id="papier-baryte" class="mt-3 font-playfair text-3xl text-[#f7f2eb]">Papier baryté</h3>
              <p class="mt-5 text-sm leading-7 text-[#e6ddd3] sm:text-base">
                Inspiré des papiers de laboratoire argentique, le baryté satiné révèle toute la profondeur et
                la richesse de vos images. Avec son fini satiné raffiné, ses noirs profonds et un rendu des détails
                d’une grande précision, il est parfait pour des photographies à forte présence, où contraste et
                finesse doivent s’exprimer pleinement.
              </p>
            </article>
          </div>

          <div class="border-y border-[#d8c9b7]/25 py-8 text-center md:py-10">
            <p class="font-playfair text-2xl leading-snug text-[#f7f2eb] md:text-3xl">Faites vivre vos photos à travers
              le temps</p>
            <p class="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#e6ddd3] sm:text-base">
              Choisissez le papier qui correspond le mieux à votre univers : douceur et discrétion du mat,
              ou éclat et profondeur du satiné.
            </p>
          </div>
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
