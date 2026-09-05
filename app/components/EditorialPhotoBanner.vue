<script setup>
defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  position: { type: String, default: 'center' },
})
</script>

<template>
  <section class="h-[52svh] min-h-96 max-h-168 overflow-hidden bg-[#e6dfdd]">
    <img :src="src" :alt="alt" width="1800" height="900" loading="eager" decoding="async"
      class="h-full w-full object-cover" :style="{ objectPosition: position }">
  </section>
</template>
