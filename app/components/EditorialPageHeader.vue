<script setup>
defineProps({
  eyebrow: { type: String, default: 'Les Photos de Cécile — depuis Amiens' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <header class="mx-auto mb-12 max-w-7xl px-5 sm:mb-16 sm:px-8 lg:px-12">
    <div class="grid gap-7 border-y border-[#d9cac2] py-8 sm:grid-cols-[1fr_auto] sm:items-end sm:py-11">
      <div class="max-w-3xl">
        <p class="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#9e8b8b]">{{ eyebrow }}</p>
        <h1 class="font-playfair text-5xl leading-none text-[#613213] sm:text-7xl lg:text-8xl">{{ title }}</h1>
      </div>
      <p v-if="description" class="max-w-sm text-base leading-7 text-[#786b68] sm:text-right">{{ description }}</p>
    </div>
  </header>
</template>
