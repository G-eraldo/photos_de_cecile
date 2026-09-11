<script setup>
import { Button } from '@/components/ui/button'

const props = defineProps({
  error: { type: Object, required: true },
})

const isNotFound = computed(() => props.error?.statusCode === 404)

useSeoMeta({
  title: () => (isNotFound.value ? 'Page introuvable' : 'Erreur du serveur'),
  description: 'Cette page des Photos de Cécile est introuvable ou temporairement indisponible.',
  robots: 'noindex, nofollow',
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#E6DFDD] px-6 py-24 font-poppins text-[#503d30]">
    <div class="mx-auto w-full max-w-xl rounded-2xl bg-white px-8 py-12 text-center shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[#786b68]">Les Photos de Cécile</p>
      <h1 class="mt-4 font-playfair text-4xl text-[#613213]">
        {{ isNotFound ? 'Page introuvable' : 'Une erreur est survenue' }}
      </h1>
      <p class="mt-5 text-sm leading-7 text-[#676463]">
        {{ isNotFound
          ? 'Cette adresse n’existe pas ou n’est plus disponible. Vous pouvez revenir à l’accueil ou me contacter.'
          : 'Le site est momentanément indisponible. Merci de réessayer dans quelques instants.' }}
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" @click="handleError">Retour à l’accueil</Button>
        <Button as-child variant="outline">
          <NuxtLink to="/contact">Me contacter</NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>
