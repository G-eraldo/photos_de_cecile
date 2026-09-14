<script setup>
import Navbar from '~/components/Navbar.vue';
import Footer from '~/components/Footer.vue';
import { isHomePreparation } from '~/utils/site-preparation';

const route = useRoute()
const showHomePreparation = computed(() => isHomePreparation(route.path))
</script>

<template>
  <div v-if="showHomePreparation">
    <slot />
  </div>
  <div v-else class="flex min-h-screen flex-col bg-background text-foreground">
    <Navbar />
    <main class="grow">
      <slot />
    </main>
    <Footer />
  </div>
</template>
