<script setup>
import photos from '~/data/home-photos.json'
</script>

<template>
  <div aria-label="Quelques instants photographiés par Cécile"
    class="mt-12 grid grid-cols-2 items-start gap-3 sm:gap-5 lg:mt-16 lg:grid-cols-4 lg:gap-6">
    <figure v-for="(photo, index) in photos" :key="photo.src"
      :class="['overflow-hidden bg-[#d8cec6]', index % 2 === 1 ? 'lg:mt-12' : '']">
      <img :src="photo.src" :srcset="photo.srcset" sizes="(min-width: 1280px) 280px, (min-width: 1024px) 23vw, 45vw"
        :width="photo.width" :height="photo.height" :alt="photo.alt" loading="lazy" decoding="async"
        class="block h-auto w-full" />
    </figure>
  </div>
</template>
