<script setup>
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Images } from 'lucide-vue-next';
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';
import EditorialPhotoBanner from '~/components/EditorialPhotoBanner.vue';

definePageMeta({ layout: 'default' });

const {
  data,
  error,
  pending,
} = await useAsyncData(
  'portfolio-photos',
  () => $fetch('/api/portfolio', {
    query: { page: 1 },
  }),
);

if (error.value?.statusCode === 404) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Portfolio introuvable',
  });
}

const featuredPhotos = computed(() => data.value?.featured || []);
const pageCount = computed(() => Number(data.value?.pageCount || 1));
const photosCount = computed(() => Number(data.value?.total || 0));

const currentPage = ref(1);
const loadingMore = ref(false);
const loadMoreError = ref(false);

const photoBatches = ref(
  data.value?.photos?.length
    ? [
        {
          page: 1,
          photos: [...data.value.photos],
        },
      ]
    : [],
);

const hasMorePhotos = computed(
  () => currentPage.value < pageCount.value,
);

const siteUrl =
  useSiteConfig().url || 'https://lesphotosdececile.fr';

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      href: new URL('/portfolio', siteUrl).href,
    },
  ],
}));

useSeoMeta({
  title: 'Portfolio',
  description:
    'Découvrez une sélection de photos de couples, familles, bébés, animaux et mariages réalisées à Amiens et en Picardie par Les Photos de Cécile.',
});

const loadMorePhotos = async () => {
  if (loadingMore.value || !hasMorePhotos.value) {
    return;
  }

  loadingMore.value = true;
  loadMoreError.value = false;

  const nextPage = currentPage.value + 1;

  try {
    const response = await $fetch('/api/portfolio', {
      query: {
        page: nextPage,
      },
    });

    const newPhotos = Array.isArray(response?.photos)
      ? response.photos
      : [];

    if (newPhotos.length) {
      photoBatches.value.push({
        page: nextPage,
        photos: newPhotos,
      });
    }

    currentPage.value = nextPage;
  }
  catch (err) {
    console.error(
      'Impossible de charger davantage de photos :',
      err,
    );

    loadMoreError.value = true;
  }
  finally {
    loadingMore.value = false;
  }
};

const buildColumns = (photos) => {
  const columns = Array.from(
    { length: 3 },
    () => ({
      height: 0,
      photos: [],
    }),
  );

  photos.forEach((photo) => {
    const ratio =
      photo.width && photo.height
        ? photo.height / photo.width
        : 1.25;

    const shortestColumn = columns.reduce(
      (shortest, column) =>
        column.height < shortest.height
          ? column
          : shortest,
    );

    shortestColumn.photos.push(photo);
    shortestColumn.height += ratio;
  });

  return columns.map((column) => column.photos);
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
  <div class="overflow-hidden pb-20">
    <EditorialPhotoBanner
      src="https://media-photodececile.lafabriqueducode.fr/5_034a70c674.png"
      alt="Un couple entouré de ses chiens dans la forêt"
      position="center 48%"
    />

    <div class="pt-10 sm:pt-16">
      <EditorialPageHeader
        title="Portfolio"
        description="Des histoires, des regards et des éclats de vie."
      />

      <div
        v-if="pending"
        class="columns-2 gap-4 sm:columns-3 lg:columns-4"
      >
        <Skeleton
          v-for="item in 12"
          :key="item"
          :class="[
            'mb-4 w-full break-inside-avoid rounded-2xl',
            item % 3 === 0
              ? 'h-72'
              : item % 2 === 0
                ? 'h-52'
                : 'h-64',
          ]"
        />
      </div>

      <Alert
        v-else-if="error"
        variant="destructive"
        class="mx-auto max-w-xl"
      >
        <AlertTitle>
          Le portfolio est indisponible
        </AlertTitle>

        <AlertDescription>
          Les photos ne peuvent pas être chargées pour le moment.
          Merci de réessayer dans quelques instants.
        </AlertDescription>
      </Alert>

      <div
        v-else-if="!photosCount"
        class="mx-auto max-w-xl rounded-2xl border border-[#e9ded8] bg-[#fdfaf8] px-6 py-10 text-center text-[#786b68]"
      >
        Les premières photos du portfolio arrivent bientôt.
      </div>

      <template v-else>
        <section
          v-if="featuredPhotos.length"
          aria-label="Sélection mise en avant"
          class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12"
        >
          <div class="mb-5 flex items-center justify-between">
            <p class="font-playfair text-lg text-[#613213]">
              Découvrez mon univers
            </p>
          </div>

          <div
            class="grid auto-rows-[42vw] grid-cols-2 gap-2 sm:auto-rows-[13vw] sm:grid-cols-6 sm:gap-3"
          >
            <a
              v-for="(photo, index) in featuredPhotos"
              :key="photo.id"
              :href="photo.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`Ouvrir ${photo.alt} en grand format`"
              :class="[
                'group relative overflow-hidden rounded-xl bg-[#2c1b13] shadow-sm sm:rounded-2xl',
                featuredLayouts[index],
              ]"
            >
              <img
                :src="photo.featuredUrl"
                :srcset="photo.featuredSrcset"
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 50vw"
                :alt="photo.alt"
                :width="photo.width"
                :height="photo.height"
                :loading="index === 0 ? 'eager' : 'lazy'"
                :fetchpriority="index === 0 ? 'high' : 'auto'"
                decoding="async"
                class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              >

              <span
                class="absolute inset-0 flex items-end justify-end bg-linear-to-t from-black/45 via-transparent to-transparent p-3 opacity-0 transition duration-300 group-hover:opacity-100"
              >
                <span
                  class="rounded-full bg-white/95 p-2 text-[#613213]"
                  aria-hidden="true"
                >
                  <ExternalLink class="size-4" />
                </span>
              </span>
            </a>
          </div>
        </section>

        <section
          aria-label="Toutes les photos"
          class="mx-auto mt-5 max-w-7xl px-5 sm:mt-6 sm:px-8 lg:px-12"
        >
          <div
            v-for="batch in photoBatches"
            :key="batch.page"
          >
            <div class="columns-1 gap-4 sm:hidden">
              <a
                v-for="photo in batch.photos"
                :key="photo.id"
                :href="photo.url"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="`Ouvrir ${photo.alt} en grand format`"
                class="group relative mb-4 block break-inside-avoid overflow-hidden rounded-2xl bg-[#2c1b13] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <img
                  :src="photo.thumbnailUrl"
                  :srcset="photo.thumbnailSrcset"
                  sizes="100vw"
                  :alt="photo.alt"
                  :width="photo.width"
                  :height="photo.height"
                  loading="lazy"
                  decoding="async"
                  class="block h-auto w-full transition duration-700 group-hover:scale-[1.03]"
                >

                <span
                  class="absolute inset-0 flex items-end justify-end bg-linear-to-t from-black/35 via-transparent to-transparent p-3 opacity-0 transition duration-300 group-hover:opacity-100"
                >
                  <span
                    class="rounded-full bg-white/90 p-2 text-[#613213]"
                    aria-hidden="true"
                  >
                    <ExternalLink class="size-4" />
                  </span>
                </span>
              </a>
            </div>

            <div class="mb-5 hidden gap-5 sm:grid sm:grid-cols-3">
              <div
                v-for="(column, columnIndex) in buildColumns(batch.photos)"
                :key="`${batch.page}-${columnIndex}`"
                class="space-y-5"
              >
                <a
                  v-for="photo in column"
                  :key="photo.id"
                  :href="photo.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="`Ouvrir ${photo.alt} en grand format`"
                  class="group relative block overflow-hidden rounded-2xl bg-[#2c1b13] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <img
                    :src="photo.thumbnailUrl"
                    :srcset="photo.thumbnailSrcset"
                    sizes="33vw"
                    :alt="photo.alt"
                    :width="photo.width"
                    :height="photo.height"
                    loading="lazy"
                    decoding="async"
                    class="block h-auto w-full transition duration-700 group-hover:scale-[1.03]"
                  >

                  <span
                    class="absolute inset-0 flex items-end justify-end bg-linear-to-t from-black/35 via-transparent to-transparent p-3 opacity-0 transition duration-300 group-hover:opacity-100"
                  >
                    <span
                      class="rounded-full bg-white/90 p-2 text-[#613213]"
                      aria-hidden="true"
                    >
                      <ExternalLink class="size-4" />
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <Alert
            v-if="loadMoreError"
            variant="destructive"
            class="mx-auto mt-8 max-w-xl"
          >
            <AlertTitle>
              Impossible de charger les photos
            </AlertTitle>

            <AlertDescription>
              Les photos suivantes n'ont pas pu être chargées.
              Vous pouvez réessayer.
            </AlertDescription>
          </Alert>

          <div
            v-if="hasMorePhotos"
            class="mt-10 flex justify-center"
          >
            <Button
              variant="outline"
              size="lg"
              :disabled="loadingMore"
              @click="loadMorePhotos"
            >
              {{ loadingMore ? 'Chargement…' : 'Afficher plus de photos' }}
            </Button>
          </div>

          <p
            v-else-if="photoBatches.length > 1"
            class="mt-10 text-center text-sm text-[#9e8b8b]"
          >
            Vous avez découvert toutes les photos.
          </p>
        </section>

        <p
          class="mt-12 flex items-center justify-center gap-2 px-5 text-center text-sm text-[#9e8b8b]"
        >
          <Images class="size-4 shrink-0" />
          <span>
            Cliquez sur une photo pour l’ouvrir en grand format.
          </span>
        </p>
      </template>
    </div>
  </div>
</template>