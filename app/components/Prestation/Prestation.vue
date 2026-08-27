<script setup>
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CalendarDays, Mail } from 'lucide-vue-next';
import { cn } from '~/lib/utils';
</script>

<template>
  <Card class="max-w-6xl mx-auto p-4 md:p-6 mt-32">
    <CardTitle class="text-xl md:text-2xl font-bold mb-4 text-[#613213] font-playfair">
      Prestations
    </CardTitle>
    <div class="mt-4 md:mt-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card v-for="prestas in presta" :key="prestas.id"
          class="p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-[#f8f4f1] flex flex-col">
          <NuxtImg :src="prestas.src" class="w-full h-48 md:h-56 rounded-lg object-cover" alt="Formats disponibles" />
          <div class="flex flex-col flex-1 mt-4">
            <div>
              <CardContent class="p-0 font-medium mb-3 text-[#9e8b8b]">
                {{ prestas.name }}
              </CardContent>
            </div>
            <div>
              <CardContent class="p-0 font-medium text-sm text-[#9e8b8b] mb-3">
                {{ prestas.description }}
              </CardContent>
            </div>
            <div>
              <CardContent class="p-0 font-medium text-[#9e8b8b] mb-5">
                {{ prestas.price }}
              </CardContent>
            </div>
            <div class="mt-auto flex justify-center">
              <Dialog>
                <DialogTrigger :class="cn(buttonVariants(), 'cursor-pointer')">
                  Détails
                </DialogTrigger>
                <DialogContent class="max-w-[90vw] max-h-[90vh] overflow-y-auto md:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle class="text-[#613213] text-xl md:text-2xl font-bold mb-4">
                      {{ prestas.name }}
                    </DialogTitle>
                    <div class="space-y-4 text-left">
                      <DialogDescription :class="cn(
                        'text-[#9e8b8b]',
                        prestas.forfait1 && prestas.forfait1.length > 0 && 'border-b-2 pb-4'
                      )">
                        {{ prestas.info }}
                      </DialogDescription>
                      <div class="grid grid-cols-3 gap-2 text-center" v-if="prestas.forfait1">
                        <DialogDescription v-for="forfait in prestas.forfait1" :key="forfait"
                          class="text-[#9e8b8b] border-r-2 font-medium">
                          {{ forfait }}
                        </DialogDescription>
                      </div>
                      <div class="grid grid-cols-3 gap-2 text-center" v-if="prestas.forfait2">
                        <DialogDescription v-for="forfait in prestas.forfait2" :key="forfait"
                          class="text-[#9e8b8b] border-r-2 font-medium">
                          {{ forfait }}
                        </DialogDescription>
                      </div>
                      <div class="grid grid-cols-3 gap-2 text-center" v-if="prestas.forfait3">
                        <DialogDescription v-for="forfait in prestas.forfait3" :key="forfait"
                          class="text-[#9e8b8b] border-r-2 font-medium">
                          {{ forfait }}
                        </DialogDescription>
                      </div>
                      <DialogDescription :class="cn(
                        'text-[#9e8b8b]',
                        prestas.forfait2 && prestas.forfait2.length > 0 && 'border-t-2 pt-4'
                      )" />

                      <DialogDescription v-if="prestas.contact"
                        class="text-[#9e8b8b] flex flex-col gap-2 items-start md:gap-6 text-left">
                        <template v-if="Array.isArray(prestas.contact)">
                          <li v-for="(contact, index) in prestas.contact" :key="index" class="list-none">
                            {{ contact }}
                          </li>
                        </template>
                        <template v-else>
                          <span>{{ prestas.contact }}</span>
                        </template>
                        <div class="flex flex-wrap gap-3">
                          <Button as-child>
                            <NuxtLink to="/contact">
                              <Mail class="mr-2 h-4 w-4" />
                              Contact
                            </NuxtLink>
                          </Button>
                          <Button as-child variant="outline">
                            <NuxtLink :to="{ path: '/reservation', query: { prestation: prestas.name } }">
                              <CalendarDays class="mr-2 h-4 w-4" />
                              Réserver
                            </NuxtLink>
                          </Button>
                        </div>
                      </DialogDescription>
                    </div>
                  </DialogHeader>

                  <DialogFooter>
                    <DialogClose as-child>
                      <Button>Fermer</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </Card>
</template>
