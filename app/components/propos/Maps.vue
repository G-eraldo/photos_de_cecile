<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const mapContainer = ref(null);
const unavailable = ref(false);
let map = null;
let disposed = false;

onBeforeUnmount(() => {
  disposed = true;
  map?.remove();
  map = null;
});
onMounted(async () => {
  try {
    const L = (await import('leaflet')).default;
    if (disposed || !mapContainer.value) return;
    const center = [49.897287, 2.275627];
    map = L.map(mapContainer.value, { center, zoom: 14 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    // Le repère indique la zone d’Amiens déjà utilisée par la carte.
    L.marker(center, { icon: L.icon({
      iconUrl: markerIcon, iconRetinaUrl: markerIconRetina, shadowUrl: markerShadow,
      iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
    }) }).addTo(map).bindPopup('Les Photos de Cécile — Amiens');
  } catch {
    unavailable.value = true;
    map?.remove();
    map = null;
  }
});
</script>

<template>
  <div class="relative h-[23vh] w-full pt-3 md:min-h-[26vh]">
    <p v-if="unavailable" role="status" class="p-4 text-sm">La carte est indisponible. Retrouvez-nous à Amiens.</p>
    <div v-else ref="mapContainer" role="region" aria-label="Carte de la zone d’Amiens" class="absolute h-full w-full" />
  </div>
</template>
