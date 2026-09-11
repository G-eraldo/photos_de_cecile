<script setup>
import EditorialPageHeader from '~/components/EditorialPageHeader.vue';

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Mentions légales',
  description: 'Mentions légales du site Les Photos de Cécile : éditeur, SIRET, hébergeur et propriété des photographies.',
  robots: 'index, follow',
})
</script>

<template>
  <div class="mt-20 min-h-screen bg-[#E6DFDD] pb-20 pt-10 font-poppins sm:mt-24 sm:pt-16">
    <EditorialPageHeader title="Mentions légales"
      description="Les informations essentielles relatives à l’édition et à l’utilisation du site." />

    <div class="px-4 sm:px-6 lg:px-8">
      <article class="mx-auto max-w-4xl rounded-2xl bg-white px-6 py-10 shadow-sm sm:px-10 md:px-14 md:py-14">
        <header class="border-b border-[#D9D2CF] pb-8 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e8b8b]">
            Les Photos de Cécile
          </p>

          <h2 class="mt-3 font-playfair text-2xl text-[#613213] md:text-3xl">
            Informations légales
          </h2>

          <p class="mt-5 text-sm leading-7 text-[#676463]">
            Dernière mise à jour : 8 septembre 2026
          </p>
        </header>

        <div class="mt-10 space-y-10 text-sm leading-7 text-[#676463]">
          <p>
            Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance
            dans l’économie numérique, les informations suivantes précisent
            l’identité des différents intervenants du présent site.
          </p>

          <section>
            <h2 class="font-playfair text-2xl text-[#5A3419]">
              Éditeur du site
            </h2>

            <div class="mt-4 rounded-xl bg-[#FAF8F7] p-5">
              <p class="font-semibold text-[#5A3419]">
                Les Photos de Cécile — Cécile DELLENBACH
              </p>

              <p>Entreprise individuelle</p>
              <p>SIRET : 932 116 643 00010</p>
              <p>8 allée sablée, 80000 Amiens, France</p>

              <p>
                Téléphone :
                <a class="text-[#5A3419] underline" href="tel:+33771773859">
                  07 71 77 38 59
                </a>
              </p>

              <p>
                E-mail :
                <a class="text-[#5A3419] underline" href="mailto:lesphotosdececile80@gmail.com">
                  lesphotosdececile80@gmail.com
                </a>
              </p>
            </div>

            <p class="mt-4">
              Directrice de la publication : Cécile DELLENBACH.
            </p>
          </section>

          <section>
            <h2 class="font-playfair text-2xl text-[#5A3419]">
              Conception et réalisation du site
            </h2>

            <div class="mt-4 rounded-xl bg-[#FAF8F7] p-5">
              <p class="font-semibold text-[#5A3419]">
                La Fabrique du Code — Gérald FRANCOIS
              </p>

              <p>Entreprise individuelle</p>
              <p>SIRET : 994 074 458 00010</p>
              <p>11 rue de la Gare, 80360 Guillemont, France</p>

              <p>
                E-mail :
                <a class="text-[#5A3419] underline" href="mailto:lafabriqueducode@gmail.com">
                  lafabriqueducode@gmail.com
                </a>
              </p>

              <p>
                Site internet :
                <a class="text-[#5A3419] underline" href="https://lafabriqueducode.fr" target="_blank"
                  rel="noopener noreferrer">
                  lafabriqueducode.fr
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 class="font-playfair text-2xl text-[#5A3419]">
              Hébergement
            </h2>

            <div class="mt-4 rounded-xl bg-[#FAF8F7] p-5">
              <p class="font-semibold text-[#5A3419]">
                IONOS SARL
              </p>

              <p>
                7 Place de la Gare, BP 70109,<br>
                57200 Sarreguemines Cedex, France
              </p>

              <p>
                Téléphone :
                <a class="text-[#5A3419] underline" href="tel:+33970808911">
                  +33 9 70 80 89 11
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 class="font-playfair text-2xl text-[#5A3419]">
              Propriété intellectuelle
            </h2>

            <p class="mt-3">
              L’ensemble des contenus présents sur le site, notamment les
              photographies, textes, éléments graphiques, logos et autres
              contenus éditoriaux, est susceptible d’être protégé par le droit
              de la propriété intellectuelle.
            </p>

            <p class="mt-3">
              Les photographies présentées sur le site restent la propriété de
              leurs auteurs ou titulaires de droits respectifs. Toute
              reproduction, représentation, modification, adaptation ou
              exploitation, totale ou partielle, sans autorisation préalable du
              titulaire des droits concerné est interdite, sauf exception
              prévue par la loi.
            </p>
          </section>

          <section>
            <h2 class="font-playfair text-2xl text-[#5A3419]">
              Responsabilité
            </h2>

            <p class="mt-3">
              L’éditrice du site s’efforce de fournir des informations aussi
              exactes et à jour que possible. Toutefois, elle ne peut garantir
              l’exactitude, l’exhaustivité ou l’actualité permanente des
              informations diffusées sur le site.
            </p>

            <p class="mt-3">
              Le site peut contenir des liens vers des sites ou services tiers.
              L’éditrice ne peut être tenue responsable du contenu, du
              fonctionnement ou des politiques de confidentialité de ces sites
              externes.
            </p>
          </section>

          <section>
            <h2 class="font-playfair text-2xl text-[#5A3419]">
              Données personnelles
            </h2>

            <p class="mt-3">
              Les informations relatives à la collecte, à l’utilisation et à la
              conservation des données personnelles sont détaillées dans la
              <NuxtLink class="text-[#5A3419] underline" to="/politique-confidentialite">
                politique de confidentialité
              </NuxtLink>.
            </p>
          </section>
        </div>
      </article>
    </div>
  </div>
</template>