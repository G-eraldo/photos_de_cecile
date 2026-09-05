<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner';
import 'vue-sonner/style.css';

useSeoMeta({
  titleTemplate: '%s %separator %siteName',
  title: 'les photos de Cécile',
  description: 'Je photographie les moments de vie de façon authentique à Amiens & ses alentours. Grossesse, naissance, shooting boudoir, baptême, mariage, anniversaire, animaux de compagnie, couple, famille...',
  ogImage: 'https://res.cloudinary.com/dlnbsf2ed/image/upload/v1788172116/DSC_01869_a27295b7c4.jpg',
  ogTitle: 'les photos de Cécile | Photographe à Amiens',
  ogDescription: 'Je photographie les moments de vie de façon authentique à Amiens & ses alentours. Grossesse, naissance, shooting boudoir, baptême, mariage, anniversaire, animaux de compagnie, couple, famille...',
  twitterCard: 'summary_large_image',
  twitterTitle: 'les photos de Cécile | Photographe à Amiens',
  twitterDescription: 'Je photographie les moments de vie de façon authentique à Amiens & ses alentours. Grossesse, naissance, shooting boudoir, baptême, mariage, anniversaire, animaux de compagnie, couple, famille...',
  twitterImage: 'https://res.cloudinary.com/dlnbsf2ed/image/upload/v1788172116/DSC_01869_a27295b7c4.jpg',
});

useHead({
  htmlAttrs: { lang: 'fr' },
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
    { rel: 'shortcut icon', href: '/favicon.ico' },
  ],
  meta: [
    { name: 'geo.region', content: 'FR-80' },
    { name: 'geo.placename', content: 'Amiens' },
    { name: 'ICBM', content: '49.894067,2.295753' },
    { name: 'DC.title', content: 'Photographe professionnelle Amiens' },
    { name: 'keywords', content: 'photographe Amiens, photographe mariage Amiens, photographe portrait Amiens, shooting photo Amiens, photographe grossesse Amiens, photographe baptême Amiens, photographe famille Picardie, photographie professionnelle Somme' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Cécile",
        url: "https://photodececile.lafabriqueducode.fr",
        image: "https://res.cloudinary.com/dlnbsf2ed/image/upload/v1788172116/DSC_01869_a27295b7c4.jpg",
        description: "Je photographie les moments de vie de façon authentique à Amiens & ses alentours. Grossesse, naissance, shooting boudoir, baptême, mariage, anniversaire, animaux de compagnie, couple, famille...",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Amiens",
          addressCountry: "France"
        },
        sameAs: [
          "https://www.instagram.com/lesphotosdececile80/",
          "https://www.facebook.com/people/Les-photos-de-C%C3%A9cile/61564364920740/"
        ]
      })
    }
  ]
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <CookieBanner />
    <Toaster />
  </div>
</template>
