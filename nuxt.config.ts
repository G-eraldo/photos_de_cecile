// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

const strapiOrigin = (process.env.STRAPI_URL || "https://back-cecile.lafabriqueducode.fr").replace(/\/$/, "");
const r2Origin = process.env.R2_ACCOUNT_ID
  ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : "";
const connectSources = [
  "'self'",
  strapiOrigin,
  r2Origin,
  "https://*.maptiler.com",
  "https://static.elfsight.com",
  "https://*.elfsight.com",
  "https://*.elfsightcdn.com",
].filter(Boolean).join(" ");

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
    "/**": {
      headers: {
        "Content-Security-Policy": `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' https://static.elfsight.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://*.maptiler.com; connect-src ${connectSources}; frame-src https://*.mollie.com https://*.elfsight.com; upgrade-insecure-requests`,
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
      },
    },
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
