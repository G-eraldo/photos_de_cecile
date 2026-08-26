<script setup>
import { Menu, X } from 'lucide-vue-next';
import { onMounted, onUnmounted, ref } from 'vue';
import { cn } from '~/lib/utils';

const menuItems = [
  { name: "À propos", href: "/a-propos" },
  { name: "Prestations", href: "/prestations" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Tirages photos", href: "/tirage-photo" },
  { name: "Contact", href: "/contact" },
];

const menuState = ref(false);
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <header class="font-poppins">
    <nav :data-state="menuState ? 'active' : undefined" class="fixed z-20 w-full px-2">
      <div :class="cn(
        'mx-auto mt-2 max-w-6xl px-4 sm:px-6 transition-all duration-300 lg:px-12',
        isScrolled &&
        'max-w-4xl rounded-2xl border border-[#D9D2CF] bg-white/95 shadow-xl backdrop-blur-lg lg:px-5'
      )">
        <div class="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">

          <div class="flex w-full justify-between lg:w-auto text-xl">
            <NuxtLink to="/" aria-label="home" :class="[
              'flex items-center space-x-2 font-playfair transition-colors duration-300',
              isScrolled
                ? 'text-[#5A3419]'
                : 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]',
              'hover:text-[#C9A227]'
            ]">
              Les Photos de Cécile
            </NuxtLink>

            <button :aria-label="menuState ? 'Close Menu' : 'Open Menu'"
              class="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] transition-colors duration-300 hover:text-[#C9A227] lg:hidden"
              :class="isScrolled ? 'text-[#5A3419] drop-shadow-none' : ''" @click="menuState = !menuState">
              <Menu
                class="data-[state=active]:rotate-180 data-[state=active]:scale-0 data-[state=active]:opacity-0 m-auto size-6 duration-200" />

              <X
                class="data-[state=active]:rotate-0 data-[state=active]:scale-100 data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
            </button>
          </div>

          <div :class="[
            'absolute size-fit lg:block text-xl transition-all duration-1000 hidden',
            isScrolled ? 'right-10' : 'inset-0 m-auto pl-52'
          ]">
            <ul class="flex gap-8 text-lg">
              <li v-for="(item, index) in menuItems" :key="index">
                <NuxtLink :to="item.href" :class="[
                  'block font-medium transition-colors duration-300 hover:text-[#C9A227]',
                  isScrolled
                    ? 'text-[#5A3419]'
                    : 'text-[#F2F0EF] drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]'
                ]">
                  {{ item.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div
            class="bg-background data-[state=active]:block lg:data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
            <div class="lg:hidden">
              <ul class="space-y-6 text-base">
                <li v-for="(item, index) in menuItems" :key="index">
                  <NuxtLink :to="item.href"
                    class="block text-[#5A3419] transition-colors duration-300 hover:text-[#C9A227]"
                    @click="menuState = false">
                    <span>{{ item.name }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </nav>
  </header>
</template>