<script setup>
import { computed, onMounted, ref } from 'vue';
import { CalendarDays, Mail } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'vue-sonner';

const route = useRoute();
const prestation = computed(() => typeof route.query.prestation === 'string' ? route.query.prestation : '');
const nom = ref('');
const prenom = ref('');
const email = ref('');
const date = ref('');
const heure = ref('');
const message = ref('');
const pending = ref(false);

const availability = ref([]);
const reservations = ref([]);
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
    for (const slotStart = new Date(start); slotStart.getTime() + 2 * 60 * 60 * 1000 <= end.getTime(); slotStart.setHours(slotStart.getHours() + 2)) {
      const slotEnd = new Date(slotStart.getTime() + 2 * 60 * 60 * 1000);
      const reserved = reservations.value.some((reservation) => slotStart < new Date(reservation.end) && slotEnd > new Date(reservation.start));
      if (reserved) continue;
      slots.push({
        value: `${String(slotStart.getHours()).padStart(2, '0')}:${String(slotStart.getMinutes()).padStart(2, '0')}`,
        label: `${String(slotStart.getHours()).padStart(2, '0')}h – ${String((slotStart.getHours() + 2) % 24).padStart(2, '0')}h`,
      });
    }
    return slots;
  });
});

const loadAvailability = async () => {
  try {
    const data = await $fetch('/api/calendar/events');
    availability.value = data.availability || [];
    reservations.value = data.reservations || [];
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
  if (!nom.value || !prenom.value || !email.value || !date.value || !heure.value) {
    toast.error('Merci de renseigner vos coordonnées, la date et le créneau souhaités.');
    return;
  }

  pending.value = true;
  try {
    const response = await $fetch('/api/calendar/reservations', {
      method: 'POST',
      body: { nom: nom.value, prenom: prenom.value, email: email.value, prestation: prestation.value || 'Séance photo', date: date.value, heure: heure.value, message: message.value },
    });

    if (response.success) {
      toast.success(response.emailSent ? 'Votre réservation est confirmée. Un e-mail vient de vous être envoyé.' : 'Votre réservation est confirmée.');
      message.value = '';
      heure.value = '';
      await loadAvailability();
    } else {
      toast.error(response.message);
    }
  } catch {
    toast.error("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <Card class="max-w-2xl mx-auto p-4 md:p-6 mt-32">
    <div class="flex items-center gap-3 mb-4">
      <CalendarDays class="h-6 w-6 text-[#613213]" />
      <CardTitle class="text-xl md:text-2xl font-bold text-[#613213]">Réserver une séance</CardTitle>
    </div>
    <CardDescription class="mb-6 text-[#9e8b8b]">
      Les créneaux affichés sont ceux définis par Cécile dans son agenda. Chaque rendez-vous dure deux heures et sera confirmé après vérification.
    </CardDescription>

    <form class="space-y-4 text-[#9e8b8b]" @submit.prevent="submit">
      <p v-if="prestation" class="text-sm">Prestation choisie : <strong>{{ prestation }}</strong></p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="grid gap-2"><Label for="reservation-nom">Votre nom</Label><Input id="reservation-nom" v-model="nom" required /></div>
        <div class="grid gap-2"><Label for="reservation-prenom">Votre prénom</Label><Input id="reservation-prenom" v-model="prenom" required /></div>
      </div>
      <div class="grid gap-2"><Label for="reservation-email">Votre email</Label><Input id="reservation-email" v-model="email" type="email" required /></div>
      <div class="rounded-lg border p-4">
        <div class="flex items-center justify-between mb-4">
          <Button type="button" variant="ghost" size="sm" aria-label="Mois précédent" @click="changeMonth(-1)">‹</Button>
          <p class="font-medium capitalize text-[#613213]">{{ calendarMonthLabel }}</p>
          <Button type="button" variant="ghost" size="sm" aria-label="Mois suivant" @click="changeMonth(1)">›</Button>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center text-xs">
          <span v-for="weekDay in weekDays" :key="weekDay" class="py-2 font-medium">{{ weekDay }}</span>
          <div v-for="(day, index) in calendarDays" :key="day?.value || `empty-${index}`" class="aspect-square">
            <Button v-if="day" type="button" size="sm" :variant="date === day.value ? 'default' : 'ghost'" :disabled="!day.available || loadingCalendar" :class="['h-full w-full p-0', day.available ? 'font-semibold' : 'opacity-30']" @click="selectDate(day.value)">
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
          <Button v-for="slot in availableSlots" :key="slot.value" type="button" :variant="heure === slot.value ? 'default' : 'outline'" @click="heure = slot.value">
            {{ slot.label }}
          </Button>
        </div>
        <p v-if="date && !availableSlots.length" class="text-sm">Aucun créneau de deux heures n’est disponible ce jour-là.</p>
      </div>
      <div class="grid gap-2"><Label for="reservation-message">Précisions (facultatif)</Label><Textarea id="reservation-message" v-model="message" placeholder="Lieu, formule choisie, vos disponibilités…" /></div>
      <div class="flex justify-center"><Button type="submit" :disabled="pending"><Mail class="mr-2 h-4 w-4" />{{ pending ? 'Envoi en cours…' : 'Envoyer ma demande' }}</Button></div>
    </form>
  </Card>
</template>
