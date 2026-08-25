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
  ],

  site: {
    url: "https://les-photos-de-cecile-l7f5.vercel.app",
    name: "Les photos de Cécile",
    description:
      "Je photographie les moments de vie de façon authentique à Amiens & ses alentours.",
    defaultLocale: "fr",
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
      maptilerApiKey: "",
    },
  },
});
