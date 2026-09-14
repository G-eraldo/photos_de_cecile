<script setup>
import Navbar from '~/components/Navbar.vue';
import Footer from '~/components/Footer.vue';
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <Navbar />
    <main class="grow">
      <slot />
    </main>
    <Footer />
  </div>
</template>
