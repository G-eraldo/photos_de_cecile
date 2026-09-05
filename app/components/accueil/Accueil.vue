<template>
  <div>

    <!-- HERO -->
    <section
      class="relative isolate flex h-[52svh] min-h-96 max-h-168 items-center justify-center overflow-hidden px-8 py-16 text-center"
      data-scroll-reveal-skip>

      <div class="absolute inset-0 -z-20">
        <NuxtImg src="https://media-photodececile.lafabriqueducode.fr/7_74ede68670.png"
          alt="Photographie Les Photos de Cécile" class="h-full w-full object-cover" />
        <div class="absolute inset-0 bg-linear-to-b from-[rgba(70,48,38,0.20)] to-[rgba(45,32,26,0.55)]" />
      </div>

      <!-- Texte -->
      <!-- <div class="relative z-20">

        <p
          class="max-w-195 translate-y-0 font-playfair text-[clamp(1.6rem,3.4vw,2.5rem)] font-normal leading-[1.4] text-white opacity-100">
          « La photographie est l'art de montrer de combien d'instants
          éphémères la vie est faite »

          <cite class="mt-5.5 block font-playfair text-[clamp(1.2rem,2vw,1.5rem)] not-italic">
            Marcel Proust
          </cite>
        </p>

      </div> -->

    </section>


    <!-- BIENVENUE -->
    <section class="bg-white px-8 py-22.5 text-center md:py-25">

      <div class="mx-auto max-w-295">

        <h2 class="font-playfair text-[clamp(2.1rem,4.4vw,3rem)] font-semibold tracking-[0.01em] text-[#5A3419]">
          Bienvenue
        </h2>

        <div class="mx-auto my-5 h-px w-17.5 bg-[#D9D2CF]" />

        <p class="mx-auto mb-4 max-w-160 text-[1.15rem] leading-[1.65] text-[#5A3419]">
          Immortalisons ensemble les moments précieux de votre vie
          avec authenticité et passion.
        </p>

        <p class="mx-auto max-w-160 text-[1.15rem] leading-[1.65] text-[#5A3419]">
          Située à Amiens, je capture votre quotidien au naturel
          pour des souvenirs intemporels.
        </p>

      </div>

    </section>


    <!-- QUI SUIS-JE -->
    <section class="bg-[#E6DFDD] px-8 py-22.5 text-center md:py-25">

      <div class="mx-auto max-w-295">

        <h2 class="mb-7.5 font-playfair text-[clamp(2rem,3.6vw,2.6rem)] font-semibold text-[#5A3419]">
          Qui suis-je ?
        </h2>

        <div class="mx-auto my-5 h-px w-17.5 bg-[#676463]" />
        <div class="mx-auto max-w-190 text-[1.1rem] leading-[1.85] text-[#676463]">

          <p class="mb-5">
            Je suis une photographe qui se déplace chez vous pour réaliser
            des séances en intérieur ou en extérieur dans notre belle région
            Picarde. Ma passion est de transformer vos moments de vie en
            souvenirs inoubliables.
          </p>

          <p class="mb-5">
            Je crois en la beauté de l'authenticité et m'efforce de raconter
            votre histoire à travers des images sincères.
          </p>

          <p>
            Que ce soit pour des portraits de famille, des photos de naissance,
            de grossesse, de vos animaux de compagnie, mais aussi de mariage
            ou bien encore tout simplement des instants de vie du quotidien,
            je vous offrirai un service chaleureux et sur-mesure.
          </p>

        </div>

        <NuxtLink to="/portfolio"
          class="mt-10 inline-block bg-[#676463] px-8.5 py-3.5 text-[0.9rem] tracking-wider text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5A3419]">
          Découvrir quelques photos
        </NuxtLink>

      </div>

    </section>

  </div>
</template>
