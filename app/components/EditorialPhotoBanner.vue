<script setup>
defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  position: { type: String, default: 'center' },
})
</script>

<template>
  <section class="mx-auto mb-12 max-w-7xl px-5 sm:mb-16 sm:px-8 lg:px-12">
    <div class="h-64 overflow-hidden bg-[#e6dfdd] sm:h-96 lg:h-120">
      <img :src="src" :alt="alt" width="1800" height="900" loading="eager" decoding="async"
        class="h-full w-full object-cover" :style="{ objectPosition: position }">
    </div>
  </section>
</template>
