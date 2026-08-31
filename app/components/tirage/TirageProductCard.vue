<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <NuxtLink :to="`/tirages-photo/${product.slug}`" class="group block text-center">
    <div class="aspect-4/5 overflow-hidden bg-[#ddd4c9]">
      <NuxtImg :src="product.imageUrl" :alt="product.titre"
        class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        sizes="sm:50vw md:33vw lg:20vw" />
    </div>
    <h3 class="mt-4 font-playfair text-lg text-[#f7f2eb] transition-colors group-hover:text-[#d8b79b]">
      {{ product.titre }}
    </h3>
    <p class="mt-1 text-sm text-[#e6ddd3]">À partir de {{ product.prix }} €</p>
  </NuxtLink>
</template>
