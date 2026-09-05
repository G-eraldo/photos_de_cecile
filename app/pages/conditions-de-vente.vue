<script setup>
import EditorialPageHeader from '~/components/EditorialPageHeader.vue'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Conditions de vente',
  description: 'Conditions de vente et contrat de prestation photographique des Photos de Cécile.',
})
</script>

<template>
  <main class="min-h-screen bg-[#E6DFDD] px-4 py-24 font-poppins sm:px-6 lg:px-8">
    <EditorialPageHeader title="Conditions de vente"
      description="Les conditions qui encadrent votre séance photo, avec clarté et simplicité." />

    <div class="mx-auto max-w-4xl">

      <!-- EN-TÊTE -->
      <div class="mb-8 rounded-2xl bg-white px-6 py-10 text-center shadow-sm md:px-12">

        <p
          class="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#5A3419]"
        >
          Les photos de Cécile
        </p>

        <h2
          class="font-playfair text-2xl font-semibold text-[#613213] md:text-3xl"
        >
          Contrat de prestation photographique
        </h2>

        <div class="mx-auto mt-6 h-px w-16 bg-[#D9D2CF]" />

        <p class="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#676463]">
          Contrat de prestation photographique
        </p>

        <p class="mt-2 text-xs text-[#8F8C85]">
          Entrepreneur individuel — SIRET : 93211664300010
        </p>

      </div>


      <!-- CONTRAT -->
      <article
        class="rounded-2xl bg-white px-6 py-10 shadow-sm sm:px-10 md:px-14 md:py-14"
      >

        <!-- IDENTITÉ -->
        <section class="mb-12">

          <div class="grid gap-8 border-b border-[#D9D2CF] pb-8 md:grid-cols-2">

            <div>
              <p class="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#5A3419]">
                À l’attention de
              </p>

              <div class="space-y-1 text-sm leading-6 text-[#676463]">
                <p>Nom / Prénom :</p>
                <p>Adresse :</p>
                <p>Téléphone :</p>
                <p>Email :</p>
              </div>
            </div>

            <div>
              <p class="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#5A3419]">
                Photographe
              </p>

              <div class="space-y-1 text-sm leading-6 text-[#676463]">
                <p class="font-medium text-[#5A3419]">
                  DELLENBACH Cécile
                </p>
                <p>8 allée sablée</p>
                <p>80000 AMIENS</p>
                <p>0771773859</p>
                <p>lesphotosdececile80@gmail.com</p>
                <p>Entrepreneur individuel</p>
                <p>SIRET : 93211664300010</p>
              </div>
            </div>

          </div>

        </section>


        <!-- 1 -->
        <section class="mb-12">

          <h2 class="contract-title">
            1. Objet du contrat
          </h2>

          <p class="contract-text">
            Le présent contrat a pour objet de définir les modalités de réalisation
            d’une prestation photographique entre le Photographe et le Client.
          </p>

          <div class="mt-6 rounded-xl bg-[#FAF8F7] p-5 text-sm leading-7 text-[#676463]">
            <p>Type de prestation :</p>
            <p>Date :</p>
            <p>Lieu :</p>
            <p>Horaires :</p>
            <p>Choix du forfait :</p>
          </div>

          <p class="contract-text mt-6">
            Le Photographe s’engage à réaliser une prestation photographique
            conformément aux conditions définies dans le présent contrat.
          </p>

        </section>


        <!-- 2 -->
        <section class="mb-12">

          <h2 class="contract-title">
            2. Style artistique
          </h2>

          <p class="contract-text">
            Le Client reconnaît avoir pris connaissance du style photographique
            du Photographe (visible notamment sur son site internet
            lesphotosdececile.fr, portfolio ou réseaux sociaux) et déclare
            l’accepter.
          </p>

          <p class="contract-text">
            Les photographies livrées refléteront la vision artistique et le
            savoir-faire du Photographe. Aucun rendu spécifique ne peut être
            garanti au-delà du style habituel du Photographe.
          </p>

        </section>


        <!-- 3 -->
        <section class="mb-12">

          <h2 class="contract-title">
            3. Réservation & acompte
          </h2>

          <p class="contract-text">
            La réservation de la prestation est effective uniquement après :
          </p>

          <ul class="contract-list">
            <li>La signature du présent contrat</li>
            <li>Le versement d’un acompte de 30% du montant total</li>
          </ul>

          <p class="contract-text">
            Le solde devra être réglé au plus tard le jour de la prestation,
            sauf accord écrit différent entre les parties.
          </p>

          <p class="mt-5 font-semibold italic text-[#5A3419]">
            L’acompte versé ne sera pas remboursé en cas d’annulation par le Client.
          </p>

        </section>


        <!-- 4 -->
        <section class="mb-12">

          <h2 class="contract-title">
            4. Annulation ou report
          </h2>

          <h3 class="contract-subtitle">
            Annulation par le Client
          </h3>

          <p class="contract-text">
            En cas d’annulation par le Client :
          </p>

          <p class="contract-text">
            L’acompte versé reste acquis au Photographe.
          </p>

          <h3 class="contract-subtitle">
            Report de la prestation
          </h3>

          <p class="contract-text">
            Un report pourra être envisagé en fonction des disponibilités
            du Photographe.
          </p>

          <h3 class="contract-subtitle">
            Annulation par le Photographe
          </h3>

          <p class="contract-text">
            En cas de force majeure (maladie, accident, événement imprévu grave),
            le Photographe s’efforcera de proposer un autre photographe
            professionnel pour assurer la prestation.
          </p>

          <p class="contract-text">
            Si cela n’est pas possible, les sommes versées seront intégralement
            remboursées sans autre indemnité.
          </p>

        </section>


        <!-- 5 -->
        <section class="mb-12">

          <h2 class="contract-title">
            5. Déroulement de la prestation
          </h2>

          <p class="contract-text">
            Le Client s’engage à faciliter le travail du Photographe pendant
            la prestation.
          </p>

          <p class="contract-text">
            Le Photographe ne pourra être tenu responsable :
          </p>

          <ul class="contract-list">
            <li>D’un manque de coopération des participants</li>
            <li>De conditions météorologiques défavorables</li>
            <li>De contraintes imposées par le lieu où l’organisation de l’événement.</li>
          </ul>

          <p class="contract-text">
            Le Photographe se réserve le droit d’interrompre la prestation
            en cas de comportement inapproprié ou dangereux.
          </p>

        </section>


        <!-- 6 -->
        <section class="mb-12">

          <h2 class="contract-title">
            6. Sélection de photographies
          </h2>

          <p class="contract-text">
            Le Photographe effectue une première sélection des images réalisées
            afin d’éliminer :
          </p>

          <ul class="contract-list">
            <li>Les doublons</li>
            <li>Les images techniquement imparfaites</li>
            <li>Les tests d’exposition</li>
            <li>Les photographies ne correspondant pas aux standards de qualité.</li>
          </ul>

          <p class="contract-text">
            Le Client accepte que toutes les photographies prises lors de la
            séance ne soient pas conservées ni livrées.
          </p>

          <p class="contract-text">
            Selon la formule choisie, le Client pourra sélectionner un nombre
            défini de photographies parmi une galerie de présélection.
          </p>

          <p class="contract-text">
            Les photographies supplémentaires pourront faire l’objet d’une
            facturation complémentaire.
          </p>

        </section>


        <!-- 7 -->
        <section class="mb-12">

          <h2 class="contract-title">
            7. Post-traitement & livraison
          </h2>

          <p class="contract-text">
            Le travail de post-production fait partie intégrante du style
            du Photographe.
          </p>

          <p class="contract-text">
            Les photographies livrées seront :
          </p>

          <ul class="contract-list">
            <li>Sélectionnées</li>
            <li>Retouchées</li>
            <li>Optimisées (couleurs, contraste, luminosité)</li>
          </ul>

          <p class="contract-text">
            Le délai de livraison est estimé à 8 semaines après le retour
            de sélection du client.
          </p>

          <p class="contract-text">
            Les photographies seront livrées sous format numérique via une
            galerie privée en ligne ou un lien de téléchargement.
          </p>

        </section>


        <!-- 8 -->
        <section class="mb-12">

          <h2 class="contract-title">
            8. Non-livraison des fichiers bruts
          </h2>

          <p class="contract-text">
            Les fichiers bruts (RAW), fichiers non retouchés, et l’ensemble
            des images non sélectionnées ne sont pas livrés au Client.
          </p>

          <p class="contract-text">
            Seules les photographies finales sélectionnées et retouchées sont
            remises au Client.
          </p>

          <p class="contract-text">
            Ces fichiers restent la propriété exclusive du Photographe.
          </p>

        </section>


        <!-- 9 -->
        <section class="mb-12">

          <h2 class="contract-title">
            9. Intégrité des photographies
          </h2>

          <p class="contract-text">
            Les photographies livrées constituent des œuvres protégées par
            le droit d’auteur. Le Client s’engage à respecter l’intégrité
            des images fournies.
          </p>

          <p class="contract-text">
            Toute modification des photographies est interdite sans l’accord
            écrit préalable du Photographe.
          </p>

          <p class="contract-text">
            Sont notamment interdits :
          </p>

          <ul class="contract-list">
            <li>Filtres appliqués via des applications ou réseaux sociaux</li>
            <li>Retouches ou modifications colorimétriques</li>
            <li>Recadrages altérant l’image</li>
            <li>Ajout de texte, logo ou graphisme.</li>
          </ul>

          <p class="contract-text">
            Toute utilisation d’une image modifiée sans autorisation pourra
            être considérée comme une atteinte au droit moral du Photographe.
          </p>

        </section>


        <!-- 10 -->
        <section class="mb-12">

          <h2 class="contract-title">
            10. Droit d’utilisation par le Client
          </h2>

          <p class="contract-text">
            Le Client bénéficie d’un droit d’utilisation personnel des
            photographies livrées.
          </p>

          <p class="contract-text">
            Les images peuvent être utilisées pour :
          </p>

          <ul class="contract-list">
            <li>Un usage privé</li>
            <li>Un partage sur les réseaux sociaux</li>
            <li>Une impression personnelle.</li>
          </ul>

          <p class="contract-text">
            Toute utilisation commerciale, publicitaire ou revente des images
            nécessite l’autorisation écrite du Photographe.
          </p>

        </section>


        <!-- 11 -->
        <section class="mb-12">

          <h2 class="contract-title">
            11. Galerie en ligne
          </h2>

          <p class="contract-text">
            Lorsque les images sont présentées dans une galerie de sélection
            en ligne :
          </p>

          <ul class="contract-list">
            <li>Le Client s’engage à ne pas effectuer de captures d’écran</li>
            <li>
              Seules les images finales téléchargeables sont destinées à être utilisées.
            </li>
          </ul>

          <p class="contract-text">
            La galerie peut rester accessible pour une durée limitée (2 semaines).
          </p>

        </section>


        <!-- 12 -->
        <section class="mb-12">

          <h2 class="contract-title">
            12. Responsabilité & sauvegarde
          </h2>

          <p class="contract-text">
            Le Photographe met en œuvre tous les moyens raisonnables pour
            assurer la sécurité des fichiers.
          </p>

          <p class="contract-text">
            En cas de perte ou détérioration des images pour des raisons
            indépendantes de sa volonté (panne technique, vol, corruption
            des fichiers), la responsabilité du Photographe est limitée
            au remboursement des sommes versées.
          </p>

        </section>


        <!-- 13 -->
        <section class="mb-12">

          <h2 class="contract-title">
            13. Clause droits d’auteur et mention du photographe
          </h2>

          <p class="contract-text">
            Conformément aux dispositions des articles L.111-1, L.121-1 et
            L.122-4 du Code de la propriété intellectuelle, le Photographe
            demeure titulaire exclusif des droits d’auteur afférents aux
            photographies réalisées dans le cadre du présent contrat.
          </p>

          <p class="contract-text">
            Toute reproduction, représentation, diffusion ou exploitation
            desdites photographies, notamment sur les réseaux sociaux,
            sites internet, plateformes numériques ou tout autre support
            de communication, est autorisée sous réserve du respect du
            droit moral du Photographe, incluant notamment le droit au nom.
          </p>

          <p class="contract-text">
            À ce titre, le Client s’engage à faire figurer de manière lisible
            et non équivoque, lors de toute diffusion des photographies,
            la mention suivante :
          </p>

          <div class="my-6 rounded-xl bg-[#FAF8F7] p-5 text-sm italic leading-7 text-[#5A3419]">
            « © [Nom du photographe] » et/ou l’identification du compte
            professionnel du Photographe lorsque le support le permet.
          </div>

          <p class="contract-text">
            Cette mention ne pourra en aucun cas être supprimée, modifiée
            ou dissimulée sans l’accord écrit et préalable du Photographe.
            Tout manquement à cette obligation constituera une atteinte
            au droit moral de l’auteur et pourra donner lieu à des poursuites
            sur le fondement du Code de la propriété intellectuelle,
            sans préjudice de dommages et intérêts.
          </p>

        </section>


        <!-- 14 -->
        <section class="mb-12">

          <h2 class="contract-title">
            14. Utilisation des photos
          </h2>

          <p class="contract-text">
            Cela permet de mettre en avant mon travail, c’est important pour moi.
          </p>

          <div class="mt-6 space-y-3 rounded-xl border border-[#D9D2CF] bg-[#FAF8F7] p-5">

            <div class="flex items-start gap-3">
              <span class="mt-1 text-[#5A3419]">○</span>

              <p class="text-sm leading-6 text-[#676463]">
                J’autorise l’utilisation des photos sur les réseaux sociaux
              </p>
            </div>

            <div class="flex items-start gap-3">
              <span class="mt-1 text-[#5A3419]">○</span>

              <p class="text-sm leading-6 text-[#676463]">
                Je n’autorise pas l’utilisation des photos sur les réseaux sociaux
              </p>
            </div>

          </div>

          <p class="contract-text mt-8">
            Je soussigné(e) ______________________________ atteste avoir lu
            les informations stipulées dans le contrat et m’engage à les respecter.
          </p>

          <div class="mt-8 grid gap-8 border-t border-[#D9D2CF] pt-8 sm:grid-cols-2">

            <div>
              <p class="text-sm font-medium text-[#5A3419]">
                Signature et date du client :
              </p>

              <div class="mt-16 h-px bg-[#D9D2CF]" />
            </div>

            <div>
              <p class="text-sm font-medium text-[#5A3419]">
                Signature et date du photographe :
              </p>

              <div class="mt-16 h-px bg-[#D9D2CF]" />
            </div>

          </div>

        </section>


        <!-- ACOMPTE -->
        <section
          class="rounded-xl border border-[#D9D2CF] bg-[#FAF8F7] p-5"
        >

          <p class="text-sm leading-7 text-[#676463]">
            L’acompte devra être réglé dans un délai de
            <strong class="font-semibold text-[#5A3419]">
              7 jours
            </strong>
            à compter de la réception du contrat, passé ce délai la réservation
            ne pourra être garantie.
          </p>

        </section>


        <!-- INFORMATIONS PHOTOGRAPHE -->
        <div class="mt-12 border-t border-[#D9D2CF] pt-8 text-center">

          <p class="font-playfair text-xl text-[#5A3419]">
            Les photos de Cécile
          </p>

          <p class="mt-2 text-xs text-[#8F8C85]">
            DELLENBACH Cécile
          </p>

          <p class="text-xs text-[#8F8C85]">
            8 allée sablée — 80000 AMIENS
          </p>

          <p class="text-xs text-[#8F8C85]">
            0771773859 — lesphotosdececile80@gmail.com
          </p>

          <p class="mt-1 text-xs text-[#8F8C85]">
            SIRET : 93211664300010
          </p>

        </div>

      </article>


      <!-- RETOUR -->
      <div class="mt-8 text-center">

        <NuxtLink
          to="/"
          class="inline-flex items-center rounded-md bg-[#676463] px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5A3419]"
        >
          Retour au site
        </NuxtLink>

      </div>

    </div>

  </main>
</template>
