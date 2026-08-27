<script setup>
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  CalendarDays,
  Mail,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { cn } from '~/lib/utils'
import Alert from '../ui/alert/Alert.vue'
import AlertDescription from '../ui/alert/AlertDescription.vue'
import Skeleton from '../ui/skeleton/Skeleton.vue'

const { find } = useStrapi()

const {
  data: prestations,
  pending,
  error,
} = await useAsyncData('prestations', () =>
  find('prestations', {
    populate: '*',
    filters: {
      actif: {
        $eq: true,
      },
    },
  })
)

const prestationsList = computed(() => {
  if (!prestations.value?.data) {
    return []
  }

  return prestations.value.data.map((prestation) => {
    const formules = prestation.Formule || prestation.formule || []

    return {
      ...prestation,
      formules: Array.isArray(formules)
        ? [...formules].sort(
          (a, b) => (a.ordre ?? 0) - (b.ordre ?? 0)
        )
        : [],
    }
  })
})

const getImageUrl = (image) => {
  if (!image?.url) {
    return null
  }

  if (image.url.startsWith('http')) {
    return image.url
  }

  const config = useRuntimeConfig()

  return `${config.public.strapi.url}${image.url}`
}

const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') {
    return ''
  }

  return `${Number(price).toLocaleString('fr-FR')} €`
}
</script>

<template>
  <!-- Chargement -->
  <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
    <Skeleton v-for="i in 3" :key="i" class="h-96 w-full rounded-lg" />
  </div>

  <!-- Erreur -->
  <div v-else-if="error" class="mb-16">
    <Alert variant="destructive" class="max-w-xl mx-auto">
      <AlertDescription>
        Impossible de charger les prestations.
      </AlertDescription>
    </Alert>
  </div>

  <!-- Prestations -->
  <Card v-else class="max-w-6xl mx-auto p-4 md:p-6 mt-32">
    <CardTitle class="text-xl md:text-2xl font-bold mb-4 text-[#613213] font-playfair">
      Prestations
    </CardTitle>

    <div v-if="prestationsList.length" class="mt-4 md:mt-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="prestas in prestationsList" :key="prestas.id || prestas.documentId"
          class="p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-[#f8f4f1] flex flex-col">
          <!-- Image -->
          <NuxtImg v-if="getImageUrl(prestas.image)" :src="getImageUrl(prestas.image)"
            :alt="prestas.image?.alternativeText || prestas.nom" class="w-full h-48 md:h-56 rounded-lg object-cover" />

          <!-- Contenu -->
          <div class="flex flex-col flex-1 mt-4">
            <CardContent class="p-0 font-bold text-lg mb-3 text-[#613213] font-playfair">
              {{ prestas.nom }}
            </CardContent>

            <CardContent class="p-0 font-medium text-sm text-[#9e8b8b] mb-5">
              {{ prestas.description }}
            </CardContent>

            <!-- Formules -->
            <div v-if="prestas.formules.length" class="mb-5">
              <div class="space-y-1">
                <div v-for="formule in prestas.formules" :key="formule.id"
                  class="flex items-center justify-between gap-3 text-sm">
                  <span class="text-[#613213] font-medium">
                    {{ formule.nom }}
                  </span>

                  <span class="text-[#613213] font-bold whitespace-nowrap">
                    {{ formatPrice(formule.prix) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Pas de formule -->
            <div v-else class="mb-5 text-sm text-[#9e8b8b]">
              Devis personnalisé
            </div>

            <!-- Bouton -->
            <div class="mt-auto flex justify-center">
              <Dialog>
                <DialogTrigger :class="cn(
                  buttonVariants(),
                  'cursor-pointer'
                )">
                  Détails
                </DialogTrigger>

                <DialogContent class="max-w-[90vw] max-h-[90vh] overflow-y-auto md:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle class="text-[#613213] text-xl md:text-2xl font-bold mb-4">
                      {{ prestas.nom }}
                    </DialogTitle>

                    <div class="space-y-6 text-left">
                      <!-- Description -->
                      <DialogDescription v-if="prestas.description" class="text-[#9e8b8b] whitespace-pre-line">
                        {{ prestas.description }}
                      </DialogDescription>

                      <!-- Formules -->
                      <div v-if="prestas.formules.length" class="space-y-4">
                        <div v-for="formule in prestas.formules" :key="formule.id"
                          class="border rounded-lg p-4 border-[#e4d8d2]">
                          <!-- Nom + prix -->
                          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                            <h3 class="text-lg font-bold text-[#613213] font-playfair">
                              {{ formule.nom }}
                            </h3>

                            <span v-if="
                              formule.prix !== null &&
                              formule.prix !== undefined
                            " class="text-lg font-bold text-[#613213]">
                              {{ formatPrice(formule.prix) }}
                            </span>
                          </div>

                          <!-- Informations -->
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#9e8b8b]">
                            <!-- Nombre de photos -->
                            <div v-if="formule.nombre_photos" class="flex flex-col">
                              <span class="font-semibold text-[#613213]">
                                Photos
                              </span>

                              <span>
                                {{ formule.nombre_photos }}
                              </span>
                            </div>

                            <!-- Durée -->
                            <div v-if="formule.duree" class="flex flex-col">
                              <span class="font-semibold text-[#613213]">
                                Durée
                              </span>

                              <span>
                                {{ formule.duree }}
                              </span>
                            </div>
                          </div>

                          <!-- Détails formule -->
                          <div v-if="formule.details" class="mt-4 pt-4 border-t border-[#e4d8d2]">
                            <p class="text-sm text-[#9e8b8b] whitespace-pre-line leading-relaxed">
                              {{ formule.details }}
                            </p>
                          </div>

                          <!-- Acompte -->
                          <div v-if="
                            formule.acompte_pourcentage !== null &&
                            formule.acompte_pourcentage !== undefined &&
                            formule.acompte_pourcentage !== ''
                          " class="mt-4 text-sm text-[#9e8b8b]">
                            Acompte :
                            <span class="font-semibold text-[#613213]">
                              {{ formule.acompte_pourcentage }} %
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Corporate / prestation sans formule -->
                      <div v-else class="border rounded-lg p-4 border-[#e4d8d2]">
                        <p class="text-sm text-[#9e8b8b] whitespace-pre-line leading-relaxed">
                          Un devis personnalisé sera proposé après échange.
                        </p>
                      </div>
                      <!-- Pack -->
                      <div v-if="prestas.pack" class="mt-2 pt-6 border-t border-[#e4d8d2]">
                        <h3 class="text-lg font-bold text-[#613213] font-playfair mb-3">
                          Informations sur le pack
                        </h3>

                        <p class="text-sm text-[#9e8b8b] whitespace-pre-line leading-relaxed">
                          {{ prestas.pack }}
                        </p>
                      </div>
                      <!-- Actions -->
                      <div class="flex flex-wrap gap-3 pt-2">
                        <Button as-child>
                          <NuxtLink to="/contact">
                            <Mail class="mr-2 h-4 w-4" />
                            Contact
                          </NuxtLink>
                        </Button>

                        <Button as-child variant="outline">
                          <NuxtLink :to="{
                            path: '/reservation',
                            query: {
                              prestation: prestas.nom,
                            },
                          }">
                            <CalendarDays class="mr-2 h-4 w-4" />
                            Réserver
                          </NuxtLink>
                        </Button>
                      </div>


                    </div>
                  </DialogHeader>

                  <DialogFooter>
                    <DialogClose as-child>
                      <Button>
                        Fermer
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Informations communes à toutes les prestations -->
    <div v-if="prestationsList.length" class="mt-10 pt-8 border-t border-[#e4d8d2]">
      <h3 class="text-lg md:text-xl font-bold text-[#613213] font-playfair mb-4">
        Informations
      </h3>

      <div class="space-y-2 text-sm md:text-base text-[#9e8b8b] leading-relaxed">
        <p>
          Toutes les photos livrées sont retouchées.
        </p>

        <p>
          Les tarifs comprennent la retouche artistique et le traitement des photos.
        </p>

        <p>
          Pour les séances en dehors d’Amiens, des frais de déplacement de
          0,40 €/km (aller-retour) sont appliqués.
        </p>

        <p>
          Les photos sont livrées en haute définition dans un délai de 2 mois via
          une galerie en ligne privée (3 mois pour les mariages).
        </p>
      </div>
    </div>

    <!-- Aucune prestation -->
    <div v-else class="py-12 text-center text-[#9e8b8b]">
      Aucune prestation disponible pour le moment.
    </div>
  </Card>
</template>