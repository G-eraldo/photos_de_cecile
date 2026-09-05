<script setup>
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Mail } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import { RESERVATION_DURATION_MS } from '~~/shared/utils/reservation-duration.js';
import Select from './ui/select/Select.vue';
import SelectContent from './ui/select/SelectContent.vue';
import SelectGroup from './ui/select/SelectGroup.vue';
import SelectItem from './ui/select/SelectItem.vue';
import SelectTrigger from './ui/select/SelectTrigger.vue';
import SelectValue from './ui/select/SelectValue.vue';
const { find } = useStrapi()

const route = useRoute();
const prestation = computed(() => typeof route.query.prestation === 'string' ? route.query.prestation : '');
const nom = ref('');
const prenom = ref('');
const email = ref('');
const date = ref('');
const heure = ref('');
const message = ref('');
const pending = ref(false);
const conditionsAccepted = ref(false);
const socialUsage = ref('');
const forfait = ref('');
const phone = ref('');
const lieu = ref('');

const availability = ref([]);
const calendarError = ref(false);
const loadingCalendar = ref(true);
const calendarMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const weekDays = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
const availableDates = computed(() => {
  const dates = new Map();

  availability.value.forEach((item) => {
    const start = new Date(item.start);
    const value = [start.getFullYear(), String(start.getMonth() + 1).padStart(2, '0'), String(start.getDate()).padStart(2, '0')].join('-');
    if (!dates.has(value)) {
      dates.set(value, {
        value,
        label: new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(start),
      });
    }
  });

  return [...dates.values()];
});

const selectedDateLabel = computed(() => availableDates.value.find((item) => item.value === date.value)?.label || '');
const calendarMonthLabel = computed(() => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(calendarMonth.value));
const availableDateValues = computed(() => new Set(availableDates.value.map((item) => item.value)));
const calendarDays = computed(() => {
  const year = calendarMonth.value.getFullYear();
  const month = calendarMonth.value.getMonth();
  const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const numberOfDays = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: firstWeekDay }, () => null);

  for (let day = 1; day <= numberOfDays; day += 1) {
    const value = [year, String(month + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
    days.push({ value, number: day, available: availableDateValues.value.has(value) });
  }

  return days;
});

const changeMonth = (offset) => {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() + offset, 1);
};

const selectDate = (value) => {
  date.value = value;
  heure.value = '';
};
const availableSlots = computed(() => {
  if (!date.value) return [];

  return availability.value.flatMap((item) => {
    const start = new Date(item.start);
    const end = new Date(item.end);
    const itemDate = [start.getFullYear(), String(start.getMonth() + 1).padStart(2, '0'), String(start.getDate()).padStart(2, '0')].join('-');
    if (itemDate !== date.value) return [];

    const slots = [];
    for (const slotStart = new Date(start); slotStart.getTime() + RESERVATION_DURATION_MS <= end.getTime(); slotStart.setTime(slotStart.getTime() + RESERVATION_DURATION_MS)) {
      const slotEnd = new Date(slotStart.getTime() + RESERVATION_DURATION_MS);
      slots.push({
        value: `${String(slotStart.getHours()).padStart(2, '0')}:${String(slotStart.getMinutes()).padStart(2, '0')}`,
        label: `${String(slotStart.getHours()).padStart(2, '0')}h – ${String(slotEnd.getHours()).padStart(2, '0')}h`,
      });
    }
    return slots;
  });
});

const loadAvailability = async () => {
  try {
    const data = await $fetch('/api/calendar/events');
    availability.value = data.availability || [];
    if (availableDates.value.length) {
      const [year, month] = availableDates.value[0].value.split('-').map(Number);
      calendarMonth.value = new Date(year, month - 1, 1);
    }
  } catch {
    calendarError.value = true;
  } finally {
    loadingCalendar.value = false;
  }
};

onMounted(loadAvailability);

const submit = async () => {
  if (!nom.value || !prenom.value || !email.value || !date.value || !heure.value || !phone.value) {
    toast.error('Merci de renseigner vos coordonnées, la date et le créneau souhaités.');
    return;
  }

  if (!forfait.value) {
    toast.error('Merci de choisir une formule.');
    return;
  }

  if (!lieu.value) {
    toast.error('Merci de choisir un lieu de prise de vue.');
    return;
  }

  if (!conditionsAccepted.value) {
    toast.error('Vous devez accepter les conditions de vente pour continuer.');
    return;
  }

  if (!socialUsage.value) {
    toast.error('Merci de choisir si vous autorisez ou non l’utilisation des photos sur les réseaux sociaux.');
    return;
  }

  pending.value = true;
  try {
    const response = await $fetch('/api/payments/mollie/create', {
      method: 'POST',
      body: {
        nom: nom.value,
        prenom: prenom.value,
        email: email.value,
        prestation: prestation.value || 'Séance photo',
        date: date.value,
        heure: heure.value,
        message: message.value,
        conditionsAccepted: conditionsAccepted.value,
        socialUsage: socialUsage.value,
        telephone: phone.value,
        forfait: forfait.value,
        prestationId: selectedPrestation.value?.documentId || selectedPrestation.value?.id || null,
        formuleId: formuleSelectionnee.value?.id || null,
        lieu: lieu.value,
      },
    });

    if (response.checkoutUrl) {
      window.location.assign(response.checkoutUrl);
      return;
    }

    toast.error('Impossible de créer le paiement de l’acompte.');
  } catch (error) {
    toast.error(error?.data?.statusMessage || error?.statusMessage || "Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
  } finally {
    pending.value = false;
  }
};

const {
  data: prestations,
  error,
} = await useAsyncData('prestations', () =>
  find('prestations', {
    populate: '*',
    sort: ['ordre:asc'],
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

const selectedPrestation = computed(() =>
  prestationsList.value.find((item) => item.nom === prestation.value) || null
)

const formules = computed(() => selectedPrestation.value?.formules || [])
const fraisKilometriques = {
  amiens: 0,
  'bois-creuse': 5,
  'etang-barrette': 15,
  'fort-mahon': 50,
  ruines: 30,
  lille: 75,
  paris: 75,
  rouen: 75,
  'st-quentin': 75,
  autre: 0,
}
const formuleSelectionnee = computed(() => formules.value.find((item) => item.nom === forfait.value) || null)
const fraisKilometriquesSelectionnes = computed(() => fraisKilometriques[lieu.value] ?? 0)
const montantAcompte = computed(() => {
  const prix = Number(formuleSelectionnee.value?.prix)
  const pourcentage = Number(formuleSelectionnee.value?.acompte_pourcentage ?? 30)

  if (!Number.isFinite(prix) || !Number.isFinite(pourcentage) || prix <= 0 || pourcentage <= 0) return null

  return (prix * pourcentage) / 100 + fraisKilometriquesSelectionnes.value
})
const formatPrice = (price) => Number(price).toLocaleString('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
</script>

<template>
  <Card class="mx-auto max-w-2xl p-4 md:p-6">
    <div class="flex items-center gap-3 mb-4">
      <CalendarDays class="h-6 w-6 text-[#613213]" />
      <CardTitle class="font-playfair text-2xl font-bold text-[#613213] md:text-3xl">Préparons votre séance</CardTitle>
    </div>
    <CardDescription class="mb-6 text-[#9e8b8b]">
      Les créneaux affichés sont ceux définis par Cécile dans son agenda. Chaque rendez-vous dure une heure et sera
      confirmé après vérification.
    </CardDescription>

    <form class="space-y-4 text-[#9e8b8b]" @submit.prevent="submit">
      <p v-if="prestation" class="text-sm">Prestation choisie : <strong>{{ prestation }}</strong></p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="grid gap-2"><Label for="reservation-nom">Votre nom</Label><Input id="reservation-nom" v-model="nom"
            required /></div>
        <div class="grid gap-2"><Label for="reservation-prenom">Votre prénom</Label><Input id="reservation-prenom"
            v-model="prenom" required /></div>
      </div>
      <div class="grid gap-2"><Label for="reservation-email">Votre email</Label><Input id="reservation-email"
          v-model="email" type="email" required /></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="grid gap-2"><Label for="reservation-forfait">Votre formule</Label>
          <Select v-model="forfait" :disabled="!formules.length">
            <SelectTrigger class="w-full">
              <SelectValue :placeholder="formules.length ? 'Sélectionner une formule' : 'Aucune formule disponible'" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="formule in formules" :key="formule.id" :value="formule.nom">
                  {{ formule.nom }} — {{ Number(formule.prix).toLocaleString('fr-FR') }} €
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-2"><Label for="reservation-phone">Votre téléphone</Label><Input id="reservation-phone"
            v-model="phone" type="tel" required /></div>
      </div>
      <div class="grid gap-2 ">
        <Label for="reservation-lieu">Lieu de prise de vue</Label>
        <Select v-model="lieu">
          <SelectTrigger id="reservation-lieu" class="w-full">
            <SelectValue placeholder="Sélectionner un lieu de prise de vue" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="amiens">
                Parc à Amiens : 0€
              </SelectItem>
              <SelectItem value="bois-creuse">
                Bois de creuse / bois magneux : 5€ de frais km
              </SelectItem>
              <SelectItem value="etang-barrette">
                Étang de la barrette : 15€
              </SelectItem>
              <SelectItem value="fort-mahon">
                Plage de fort Mahon / Quend : 50€ de frais km
              </SelectItem>
              <SelectItem value="ruines">
                Ruines de château : 30€
              </SelectItem>
              <SelectItem value="lille">
                Lille : 75€
              </SelectItem>
              <SelectItem value="paris">
                Paris : 75€
              </SelectItem>
              <SelectItem value="rouen">
                Rouen : 75€
              </SelectItem>
              <SelectItem value="st-quentin">
                St Quentin : 75€
              </SelectItem>
              <SelectItem value="autre">
                Autre a spécifier et/ ou à domicile
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div class="rounded-lg border p-4">
        <div class="flex items-center justify-between mb-4">
          <Button type="button" variant="ghost" size="sm" aria-label="Mois précédent"
            @click="changeMonth(-1)">‹</Button>
          <p class="font-medium capitalize text-[#613213]">{{ calendarMonthLabel }}</p>
          <Button type="button" variant="ghost" size="sm" aria-label="Mois suivant" @click="changeMonth(1)">›</Button>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center text-xs">
          <span v-for="weekDay in weekDays" :key="weekDay" class="py-2 font-medium">{{ weekDay }}</span>
          <div v-for="(day, index) in calendarDays" :key="day?.value || `empty-${index}`" class="aspect-square">
            <Button v-if="day" type="button" size="sm" :variant="date === day.value ? 'default' : 'ghost'"
              :disabled="!day.available || loadingCalendar"
              :class="['h-full w-full p-0', day.available ? 'font-semibold' : 'opacity-30']"
              @click="selectDate(day.value)">
              {{ day.number }}
            </Button>
          </div>
        </div>
        <p class="mt-3 text-xs">Les dates en surbrillance sont disponibles.</p>
        <p v-if="loadingCalendar" class="mt-2 text-sm">Chargement des disponibilités…</p>
        <p v-if="calendarError" class="text-sm text-red-500">Les disponibilités sont momentanément indisponibles.</p>
      </div>
      <div class="grid gap-2">
        <Label>Créneau souhaité <span v-if="selectedDateLabel">— {{ selectedDateLabel }}</span></Label>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Button v-for="slot in availableSlots" :key="slot.value" type="button"
            :variant="heure === slot.value ? 'default' : 'outline'" @click="heure = slot.value">
            {{ slot.label }}
          </Button>
        </div>
        <p v-if="date && !availableSlots.length" class="text-sm">Aucun créneau d’une heure n’est disponible ce
          jour-là.</p>
      </div>
      <div class="grid gap-2"><Label for="reservation-message">Précisions (facultatif)</Label><Textarea
          id="reservation-message" v-model="message" placeholder="Lieu, formule choisie, vos disponibilités…" /></div>
      <!-- CONDITIONS DE VENTE -->
      <div class="space-y-4 rounded-lg border border-[#E6DFDD] bg-[#FAF8F7] p-4">

        <div class="flex items-start gap-3">
          <Checkbox id="conditions-accepted" v-model="conditionsAccepted" required class="mt-1 shrink-0" />
          <label for="conditions-accepted" class="block min-w-0 flex-1 text-sm leading-6 text-[#676463]">
            J’ai lu et j’accepte les
            <NuxtLink to="/conditions-de-vente" target="_blank"
              class="font-medium text-[#613213] underline underline-offset-2 transition-colors hover:text-[#C9A227]">
              conditions de vente
            </NuxtLink>
            de la prestation.
            <span class="text-red-500">*</span>
          </label>
        </div>


        <!-- UTILISATION DES PHOTOS -->
        <div class="border-t border-[#E6DFDD] pt-4">

          <p class="mb-3 text-sm font-medium text-[#613213]">
            Utilisation des photos sur les réseaux sociaux
            <span class="text-red-500">*</span>
          </p>

          <p class="mb-4 text-xs leading-5 text-[#8F8C85]">
            L’utilisation des photos sur les réseaux sociaux permet à la photographe
            de mettre en avant son travail.
          </p>

          <div class="space-y-3">

            <RadioGroup v-model="socialUsage" default-value="autorise">
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="r1" value="autorise" />
                <Label for="r1" class="cursor-pointer text-sm text-[#676463]">J’autorise l’utilisation de mes photos sur
                  les réseaux
                  sociaux.</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="r2" value="n_autorise_pas" />
                <Label for="r2" class="cursor-pointer text-sm text-[#676463]">Je n’autorise pas l’utilisation de mes
                  photos
                  sur les réseaux
                  sociaux.</Label>
              </div>
            </RadioGroup>

          </div>

        </div>

      </div>
      <div class="flex justify-center">
        <Button type="submit" :disabled="pending || !conditionsAccepted || !socialUsage">
          <Mail class="mr-2 h-4 w-4" />
          {{ pending ? 'Redirection vers le paiement…' : montantAcompte ? `Payer l’acompte de ${formatPrice(montantAcompte)} €` : 'Réserver ma séance' }}
        </Button>
      </div>
    </form>
  </Card>
</template>
