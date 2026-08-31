<script setup>
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Images } from 'lucide-vue-next';

definePageMeta({ layout: 'default' });

useSeoMeta({
  title: 'Portfolio | Les Photos de Cécile',
  description: 'Découvrez une sélection de photos de couples, familles, bébés, animaux et mariages par Les Photos de Cécile.',
  ogTitle: 'Portfolio | Les Photos de Cécile',
  ogDescription: 'Un album de souvenirs, d’émotions et de lumière naturelle.',
});

const {
  data,
  error,
  pending,
} = await useAsyncData('portfolio-photos', () => $fetch('/api/portfolio'));

const photos = computed(() => data.value?.photos || []);
const initialAlbumCount = 20;
const albumBatchSize = 12;
const visibleAlbumCount = ref(initialAlbumCount);
const featuredPhotos = computed(() => photos.value.slice(0, 6));
const albumPhotos = computed(() => photos.value.slice(6));
const displayedAlbumPhotos = computed(() => albumPhotos.value.slice(0, visibleAlbumCount.value));
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
const hasMorePhotos = computed(() => displayedAlbumPhotos.value.length < albumPhotos.value.length);
const showMorePhotos = () => {
  visibleAlbumCount.value += albumBatchSize;
};
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
  <main class="mt-20 overflow-hidden pb-20 pt-10 sm:mt-24 sm:pt-16">
    <header class="mx-auto mb-12 max-w-7xl px-5 sm:mb-16 sm:px-8 lg:px-12">
      <div class="grid gap-7 border-y border-[#d9cac2] py-8 sm:grid-cols-[1fr_auto] sm:items-end sm:py-11">
        <div class="max-w-2xl">
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#9e8b8b]">Les Photos de Cécile — depuis
            Amiens</p>
          <h1 class="font-playfair text-5xl leading-none text-[#613213] sm:text-7xl lg:text-8xl">Portfolio</h1>
        </div>
        <p class="max-w-sm text-base leading-7 text-[#786b68] sm:text-right">
          Des histoires, des regards et des éclats de vie — un album libre, au fil des émotions.
        </p>
      </div>
    </header>

    <div v-if="pending" class="columns-2 gap-4 sm:columns-3 lg:columns-4">
      <Skeleton v-for="item in 12" :key="item"
        :class="['mb-4 w-full break-inside-avoid rounded-2xl', item % 3 === 0 ? 'h-72' : item % 2 === 0 ? 'h-52' : 'h-64']" />
    </div>

    <Alert v-else-if="error" variant="destructive" class="mx-auto max-w-xl">
      <AlertTitle>Le portfolio est indisponible</AlertTitle>
      <AlertDescription>Les photos ne peuvent pas être chargées pour le moment. Merci de réessayer dans quelques
        instants.</AlertDescription>
    </Alert>

    <div v-else-if="!photos.length"
      class="mx-auto max-w-xl rounded-2xl border border-[#e9ded8] bg-[#fdfaf8] px-6 py-10 text-center text-[#786b68]">
      Les premières photos du portfolio arrivent bientôt.
    </div>

    <section v-else aria-label="Sélection mise en avant" class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
      <div class="mb-5 flex items-center justify-between">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-[#9e8b8b]">À découvrir</p>
        <p class="font-playfair text-lg text-[#613213]">Une sélection d’instants vrais</p>
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

    <section v-if="albumPhotos.length" aria-label="Toutes les photos"
      class="mx-auto mt-5 max-w-7xl px-5 sm:mt-6 sm:px-8 lg:px-12">
      <div class="columns-1 gap-4 sm:hidden">
        <a v-for="photo in displayedAlbumPhotos" :key="photo.id" :href="photo.url" target="_blank"
          rel="noopener noreferrer" :aria-label="`Ouvrir ${photo.alt} en grand format`"
          class="group relative mb-4 block break-inside-avoid overflow-hidden rounded-2xl bg-[#2c1b13] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <img :src="photo.thumbnailUrl" :srcset="photo.thumbnailSrcset"
            sizes="(max-width: 639px) 100vw, 33vw" :alt="photo.alt" :width="photo.width"
            :height="photo.height" loading="lazy" decoding="async"
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
          <a v-for="photo in column" :key="photo.id" :href="photo.url" target="_blank"
            rel="noopener noreferrer" :aria-label="`Ouvrir ${photo.alt} en grand format`"
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
      <div v-if="hasMorePhotos" class="mt-10 text-center">
        <Button variant="outline" class="border-[#b9957f] bg-transparent px-7 text-[#613213] hover:bg-[#f1e9e5]"
          @click="showMorePhotos">
          Afficher 12 photos de plus
        </Button>
      </div>
    </section>

    <p v-if="photos.length"
      class="mt-12 flex items-center justify-center gap-2 px-5 text-center text-sm text-[#9e8b8b]">
      <Images class="size-4" /> Cliquez sur une photo pour l’ouvrir en grand format.
    </p>
  </main>
</template>
