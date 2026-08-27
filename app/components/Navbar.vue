<script setup>
import { Menu, X } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import { cn } from '~/lib/utils'

const menuItems = [
  { name: 'À propos', href: '/a-propos' },
  { name: 'Prestations', href: '/prestations' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Tirages photos', href: '/tirages-photo' },
  { name: 'Contact', href: '/contact' },
]

const menuState = ref(false)
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const closeMenu = () => {
  menuState.value = false
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header class="font-poppins">
    <nav class="fixed left-0 top-0 z-50 w-full px-2">

      <div :class="cn(
        'mx-auto mt-2 px-4 transition-all duration-300 sm:px-6 lg:px-12',
        isScrolled
          ? 'max-w-4xl rounded-2xl border border-[#D9D2CF] bg-white/95 backdrop-blur-lg lg:px-5'
          : 'max-w-6xl'
      )">

        <div class="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">

          <!-- LOGO + BURGER -->
          <div class="flex w-full items-center justify-between lg:w-auto">

            <NuxtLink to="/" aria-label="Accueil" :class="cn(
              'flex items-center font-playfair text-xl transition-all duration-300 sm:text-2xl',
              isScrolled
                ? 'text-[#5A3419] hover:text-[#C9A227]'
                : 'text-white mix-blend-difference hover:text-white'
            )">
              Les Photos de Cécile
            </NuxtLink>

            <!-- BURGER MOBILE -->
            <button type="button" :aria-label="menuState ? 'Fermer le menu' : 'Ouvrir le menu'"
              :aria-expanded="menuState" :class="cn(
                'relative z-50 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 lg:hidden',
                isScrolled
                  ? 'text-[#5A3419] hover:text-[#C9A227]'
                  : 'text-white mix-blend-difference'
              )" @click="menuState = !menuState">
              <X v-if="menuState" class="size-7" />
              <Menu v-else class="size-7" />
            </button>

          </div>

          <!-- NAVIGATION DESKTOP -->
          <div class="hidden lg:block" :class="isScrolled ? 'lg:mr-0' : ''">

            <ul class="flex items-center gap-8 text-base xl:text-lg">

              <li v-for="(item, index) in menuItems" :key="index">

                <NuxtLink :to="item.href" :class="cn(
                  'block font-medium font-playfair transition-all duration-300',
                  isScrolled
                    ? 'text-[#5A3419] hover:text-[#C9A227]'
                    : 'text-white mix-blend-difference hover:text-white'
                )">
                  {{ item.name }}
                </NuxtLink>

              </li>

            </ul>

          </div>

          <!-- MENU MOBILE -->
          <div v-if="menuState"
            class="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-[#D9D2CF] bg-white p-6 shadow-2xl lg:hidden">

            <ul class="flex flex-col gap-5">

              <li v-for="(item, index) in menuItems" :key="index">

                <NuxtLink :to="item.href"
                  class="block border-b border-[#E6DFDD] pb-4 font-poppins text-base font-medium text-[#5A3419] transition-colors duration-300 last:border-0 hover:text-[#C9A227]"
                  @click="closeMenu">
                  {{ item.name }}
                </NuxtLink>

              </li>

            </ul>

          </div>

        </div>

      </div>

    </nav>
  </header>
</template>