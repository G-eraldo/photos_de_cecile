<script setup>
import EditorialPageHeader from '~/components/EditorialPageHeader.vue'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Mentions légales',
  description: 'Les mentions légales du site Les Photos de Cécile.',
  robots: 'index, follow',
})
</script>

<template>
  <main class="mt-20 min-h-screen bg-[#E6DFDD] pb-20 pt-10 font-poppins sm:mt-24 sm:pt-16">
    <EditorialPageHeader title="Mentions légales"
      description="Les informations essentielles relatives à l’édition et à l’utilisation du site." />
    <div class="px-4 sm:px-6 lg:px-8">
    <article class="mx-auto max-w-4xl rounded-2xl bg-white px-6 py-10 shadow-sm sm:px-10 md:px-14 md:py-14">
      <header class="border-b border-[#D9D2CF] pb-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e8b8b]">Les Photos de Cécile</p>
        <h2 class="mt-3 font-playfair text-2xl text-[#613213] md:text-3xl">Informations légales</h2>
        <p class="mt-5 text-sm leading-7 text-[#676463]">Dernière mise à jour : 4 septembre 2026</p>
      </header>

      <div class="mt-10 space-y-10 text-sm leading-7 text-[#676463]">
        <p>Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, les
          informations suivantes précisent l’identité des intervenants du présent site.</p>

        <section>
          <h2 class="font-playfair text-2xl text-[#5A3419]">Édition du site</h2>
          <div class="mt-4 rounded-xl bg-[#FAF8F7] p-5">
            <p class="font-semibold text-[#5A3419]">La fabrique du code</p>
            <p>Entreprise individuelle</p>
            <p>SIRET : 994 074 458 00010</p>
            <p>11 rue de la gare 80360 Guillemont, France</p>
            <p>Téléphone : <a class="text-[#5A3419] underline" href="tel:+33767265366">07 67 26 53 66</a></p>
            <p>E-mail : <a class="text-[#5A3419] underline"
                href="mailto:lafabriqueducode@gmail.com">lafabriqueducode@gmail.com</a></p>
          </div>
          <p class="mt-4">Directeur de la publication : Gérald FRANCOIS.</p>
        </section>

        <section>
          <h2 class="font-playfair text-2xl text-[#5A3419]">Hébergement</h2>
          <p class="mt-3"> Le Site est hébergé par la société IONOS SARL, située 7 Place
            de la Gare, BP 70109, 57200 Sarreguemines Cedex, France
            (contact téléphonique : +33 9 70 80 89 11).
          </p>
        </section>

        <section>
          <h2 class="font-playfair text-2xl text-[#5A3419]">Propriété intellectuelle</h2>
          <p class="mt-3">L’ensemble du site, notamment les photographies, textes, éléments graphiques, logos et sa
            structure, est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation,
            adaptation ou exploitation, totale ou partielle, sans autorisation écrite préalable de La fabrique du code
            est interdite, sauf exception légale.</p>
        </section>

        <section>
          <h2 class="font-playfair text-2xl text-[#5A3419]">Responsabilité</h2>
          <p class="mt-3">Les informations publiées sont fournies à titre indicatif. L’éditrice s’efforce de les
            maintenir exactes et à jour, sans pouvoir garantir l’absence totale d’erreur ou d’interruption. Les liens
            vers des services tiers sont fournis pour faciliter la navigation ; leurs contenus et politiques relèvent de
            la responsabilité de leurs éditeurs respectifs.</p>
        </section>

        <section>
          <h2 class="font-playfair text-2xl text-[#5A3419]">Données personnelles</h2>
          <p class="mt-3">Les modalités de collecte et de traitement des données personnelles sont détaillées dans la
            <NuxtLink class="text-[#5A3419] underline" to="/politique-confidentialite">politique de confidentialité
            </NuxtLink>.
          </p>
        </section>
      </div>
    </article>
    </div>
  </main>
</template>
