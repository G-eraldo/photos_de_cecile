<script setup>
import { Toaster } from '@/components/ui/sonner';
import 'vue-sonner/style.css';

const siteUrl = useSiteConfig().url
const ogImage = 'https://res.cloudinary.com/dlnbsf2ed/image/upload/v1788172116/DSC_01869_a27295b7c4.jpg'

useSeoMeta({
  titleTemplate: '%s %separator %siteName',
  description: 'Je photographie les moments de vie de façon authentique à Amiens & ses alentours. Grossesse, naissance, shooting boudoir, baptême, mariage, anniversaire, animaux de compagnie, couple, famille...',
  ogImage,
  twitterCard: 'summary_large_image',
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
    { name: 'ICBM', content: '49.897287, 2.275627' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": ["LocalBusiness", "ProfessionalService"],
        name: "Les Photos de Cécile",
        "@id": `${siteUrl}/#business`,
        url: siteUrl,
        image: ogImage,
        telephone: "+33771773859",
        email: "lesphotosdececile80@gmail.com",
        priceRange: "€€",
        description: "Photographe professionnelle à Amiens : grossesse, naissance, famille, couple, mariage, baptême et animaux.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Amiens",
          addressCountry: "FR",
          postalCode: "80000",
          streetAddress: "8 allée sablée"
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 49.897287,
          longitude: 2.275627
        },
        areaServed: ["Amiens", "Somme", "Picardie"],
        sameAs: [
          "https://www.instagram.com/lesphotosdececile80/",
          "https://www.facebook.com/people/Les-photos-de-C%C3%A9cile/61564364920740/",
          "https://www.tiktok.com/@lesphotosdececile"
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
