// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/image",
    "@nuxt/fonts",
    "@nuxt/eslint",
    "@nuxt/icon",
    "shadcn-nuxt",
    "@nuxtjs/seo",
    "nuxt-og-image",
    "@nuxtjs/strapi",
  ],

  site: {
    url: "https://photodececile.lafabriqueducode.fr",
    name: "Les photos de Cécile",
    description:
      "Je photographie les moments de vie de façon authentique à Amiens & ses alentours.",
    defaultLocale: "fr",
  },

  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },

  routeRules: {
    "/reservation/confirmation": { robots: false, sitemap: false },
    "/tirages-photo/confirmation": { robots: false, sitemap: false },
  },

  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  shadcn: {
    prefix: "",
    componentDir: "@/components/ui",
  },
  fonts: {
    families: [
      {
        name: "Poppins",
        provider: "google",
        global: true,
      },
      {
        name: "Playfair Display",
        provider: "google",
        global: true,
      },
    ],
  },
  runtimeConfig: {
    googleCalendarApiKey: process.env.GOOGLE_CALENDAR_API_KEY,
    googleCalendarId: process.env.GOOGLE_CALENDAR_ID,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
    googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    public: {
      maptilerApiKey: process.env.NUXT_PUBLIC_MAPTILER_API_KEY,
    },
    strapi: {
      url: process.env.STRAPI_URL || "http://localhost:1337",
      prefix: "/api",
      admin: "/admin",
      version: "v5",
    },
  },
});
