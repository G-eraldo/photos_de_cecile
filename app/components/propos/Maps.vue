<script setup>
import { onMounted, ref } from 'vue';
import 'leaflet/dist/leaflet.css';

const mapContainer = ref(null);
let map = null;

onMounted(async () => {
  if (import.meta.server) return;
  const L = (await import('leaflet')).default;
  const { MaptilerLayer } = await import('@maptiler/leaflet-maptilersdk');

  if (map) return;
  const center = { lng: 2.275627, lat: 49.897287 };

  map = new L.Map(mapContainer.value, {
    center: L.latLng(center.lat, center.lng),
    zoom: 14,
  });

  const customIcon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const marker = L.marker([49.718112, 2.430251], { icon: customIcon });
  marker.addTo(map);

  const config = useRuntimeConfig();
  const apiKey = config.public.maptilerApiKey
  if (!apiKey) return

  new MaptilerLayer({
    apiKey: apiKey,
  }).addTo(map);
});
</script>

<template>
  <div class="relative w-full h-[23vh] pt-3 md:min-h-[26vh]">
    <div ref="mapContainer" class="absolute w-full h-full" />
  </div>
</template>
