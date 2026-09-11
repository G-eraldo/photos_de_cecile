<script setup>
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Images } from 'lucide-vue-next';
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';
import EditorialPhotoBanner from '~/components/EditorialPhotoBanner.vue';

definePageMeta({ layout: 'default' });



const route = useRoute();
const currentPage = computed(() => {
  const value = Number(route.query.page || 1);
  return Number.isSafeInteger(value) && value > 0 ? value : 1;
});
const {
  data,
  error,
  pending,
} = await useAsyncData(
  () => `portfolio-photos-${currentPage.value}`,
  () => $fetch('/api/portfolio', { query: { page: currentPage.value } }),
);
if (error.value?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Page du portfolio introuvable' });
}

const featuredPhotos = computed(() => data.value?.featured || []);
const displayedAlbumPhotos = computed(() => data.value?.photos || []);
const pageCount = computed(() => Number(data.value?.pageCount || 1));
const photosCount = computed(() => Number(data.value?.total || 0));
const siteUrl = useSiteConfig().url || 'https://lesphotodececile.fr';
const portfolioUrl = (page) => page === 1 ? '/portfolio' : `/portfolio?page=${page}`;
useHead(() => ({
  link: [{ rel: 'canonical', href: new URL(portfolioUrl(currentPage.value), siteUrl).href }],
}));
useSeoMeta({
  title: () => currentPage.value > 1 ? `Portfolio — page ${currentPage.value}` : 'Portfolio',
  description: 'Découvrez une sélection de photos de couples, familles, bébés, animaux et mariages réalisées à Amiens et en Picardie par Les Photos de Cécile.',
});
const albumColumns = computed(() => {
  const columns = Array.from({ length: 3 }, () => ({ height: 0, photos: [] }));

  displayedAlbumPhotos.value.forEach((photo) => {
    const ratio = photo.width && photo.height ? photo.height / photo.width : 1.25;
    const shortestColumn = columns.reduce((shortest, column) =>
      column.height < shortest.height ? column : shortest
    );

    shortestColumn.photos.push(photo);
    shortestColumn.height += ratio;
  });

  return columns.map((column) => column.photos);
});
const featuredLayouts = [
  'col-span-2 row-span-2 sm:col-span-3 sm:row-span-4',
  'col-span-1 row-span-1 sm:col-span-3 sm:row-span-2',
  'col-span-1 row-span-1 sm:col-span-3 sm:row-span-2',
  'col-span-1 row-span-1 sm:col-span-2 sm:row-span-3',
  'col-span-1 row-span-1 sm:col-span-2 sm:row-span-3',
  'col-span-2 row-span-1 sm:col-span-2 sm:row-span-3',
  'col-span-1 row-span-1 sm:col-span-3 sm:row-span-2',
  'col-span-1 row-span-1 sm:col-span-3 sm:row-span-2',
  'col-span-1 row-span-1 sm:col-span-2 sm:row-span-3',
  'col-span-1 row-span-1 sm:col-span-2 sm:row-span-3',
  'col-span-2 row-span-1 sm:col-span-2 sm:row-span-3',
  'col-span-2 row-span-1 sm:col-span-6 sm:row-span-2',
];
</script>

<template>
  <div class="overflow-hidden pb-20">
    <EditorialPhotoBanner src="https://media-photodececile.lafabriqueducode.fr/5_034a70c674.png"
      alt="Un couple entouré de ses chiens dans la forêt" position="center 48%" />
    <div class="pt-10 sm:pt-16">
      <EditorialPageHeader title="Portfolio" description="Des histoires, des regards et des éclats de vie." />

      <div v-if="pending" class="columns-2 gap-4 sm:columns-3 lg:columns-4">
        <Skeleton v-for="item in 12" :key="item"
          :class="['mb-4 w-full break-inside-avoid rounded-2xl', item % 3 === 0 ? 'h-72' : item % 2 === 0 ? 'h-52' : 'h-64']" />
      </div>

      <Alert v-else-if="error" variant="destructive" class="mx-auto max-w-xl">
        <AlertTitle>Le portfolio est indisponible</AlertTitle>
        <AlertDescription>Les photos ne peuvent pas être chargées pour le moment. Merci de réessayer dans quelques
          instants.</AlertDescription>
      </Alert>

      <div v-else-if="!photosCount">
        class="mx-auto max-w-xl rounded-2xl border border-[#e9ded8] bg-[#fdfaf8] px-6 py-10 text-center text-[#786b68]">
        Les premières photos du portfolio arrivent bientôt.
      </div>

      <section v-else-if="currentPage === 1 && featuredPhotos.length" aria-label="Sélection mise en avant"
        class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div class="mb-5 flex items-center justify-between">

          <p class="font-playfair text-lg text-[#613213]">Découvrez mon univers</p>
        </div>
        <div class="grid auto-rows-[42vw] grid-cols-2 gap-2 sm:auto-rows-[13vw] sm:grid-cols-6 sm:gap-3">
          <a v-for="(photo, index) in featuredPhotos" :key="photo.id" :href="photo.url" target="_blank"
            rel="noopener noreferrer" :aria-label="`Ouvrir ${photo.alt} en grand format`"
            :class="['group relative overflow-hidden rounded-xl bg-[#2c1b13] shadow-sm sm:rounded-2xl', featuredLayouts[index]]">
            <img :src="photo.featuredUrl" :srcset="photo.featuredSrcset"
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 50vw" :alt="photo.alt" :width="photo.width"
              :height="photo.height" :loading="index === 0 ? 'eager' : 'lazy'"
              :fetchpriority="index === 0 ? 'high' : 'auto'" decoding="async"
              class="h-full w-full object-cover transition duration-700 group-hover:scale-105">
            <span
              class="absolute inset-0 flex items-end justify-end bg-linear-to-t from-black/45 via-transparent to-transparent p-3 opacity-0 transition duration-300 group-hover:opacity-100">
              <span class="rounded-full bg-white/95 p-2 text-[#613213]" aria-hidden="true">
                <ExternalLink class="size-4" />
              </span>
            </span>
          </a>
        </div>
      </section>

      <section v-if="displayedAlbumPhotos.length" aria-label="Toutes les photos"
        class="mx-auto mt-5 max-w-7xl px-5 sm:mt-6 sm:px-8 lg:px-12">
        <div class="columns-1 gap-4 sm:hidden">
          <a v-for="photo in displayedAlbumPhotos" :key="photo.id" :href="photo.url" target="_blank"
            rel="noopener noreferrer" :aria-label="`Ouvrir ${photo.alt} en grand format`"
            class="group relative mb-4 block break-inside-avoid overflow-hidden rounded-2xl bg-[#2c1b13] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <img :src="photo.thumbnailUrl" :srcset="photo.thumbnailSrcset" sizes="(max-width: 639px) 100vw, 33vw"
              :alt="photo.alt" :width="photo.width" :height="photo.height" loading="lazy" decoding="async"
              class="block h-auto w-full transition duration-700 group-hover:scale-[1.03]">
            <span
              class="absolute inset-0 flex items-end justify-end bg-linear-to-t from-black/35 via-transparent to-transparent p-3 opacity-0 transition duration-300 group-hover:opacity-100">
              <span class="rounded-full bg-white/90 p-2 text-[#613213]" aria-hidden="true">
                <ExternalLink class="size-4" />
              </span>
            </span>
          </a>
        </div>
        <div class="hidden gap-5 sm:grid sm:grid-cols-3">
          <div v-for="(column, columnIndex) in albumColumns" :key="columnIndex" class="space-y-5">
            <a v-for="photo in column" :key="photo.id" :href="photo.url" target="_blank" rel="noopener noreferrer"
              :aria-label="`Ouvrir ${photo.alt} en grand format`"
              class="group relative block overflow-hidden rounded-2xl bg-[#2c1b13] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <img :src="photo.thumbnailUrl" :srcset="photo.thumbnailSrcset" sizes="33vw" :alt="photo.alt"
                :width="photo.width" :height="photo.height" loading="lazy" decoding="async"
                class="block h-auto w-full transition duration-700 group-hover:scale-[1.03]">
              <span
                class="absolute inset-0 flex items-end justify-end bg-linear-to-t from-black/35 via-transparent to-transparent p-3 opacity-0 transition duration-300 group-hover:opacity-100">
                <span class="rounded-full bg-white/90 p-2 text-[#613213]" aria-hidden="true">
                  <ExternalLink class="size-4" />
                </span>
              </span>
            </a>
          </div>
        </div>
        <nav v-if="pageCount > 1" aria-label="Pagination du portfolio"
          class="mt-10 flex items-center justify-center gap-4">
          <Button v-if="currentPage > 1" as-child variant="outline">
            <NuxtLink :to="portfolioUrl(currentPage - 1)" rel="prev">Photos précédentes</NuxtLink>
          </Button>
          <span class="text-sm">Page {{ currentPage }} sur {{ pageCount }}</span>
          <Button v-if="currentPage < pageCount" as-child variant="outline">
            <NuxtLink :to="portfolioUrl(currentPage + 1)" rel="next">Photos suivantes</NuxtLink>
          </Button>
        </nav>
      </section>

      <p v-if="photosCount">
        class="mt-12 flex items-center justify-center gap-2 px-5 text-center text-sm text-[#9e8b8b]">
        <Images class="size-4" /> Cliquez sur une photo pour l’ouvrir en grand format.
      </p>
    </div>
  </div>
</template>
