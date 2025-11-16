<template>
  <div style="height: 400px; width: 100%; border-radius: 8px; overflow: hidden;">
    <l-map
      v-if="path.length > 0"
      :zoom="zoom"
      :center="center"
      :bounds="bounds"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
        layer-type="base"
        name="OpenStreetMap"
      />
      <l-polyline
        :lat-lngs="path"
        color="#FC4C02"
        :weight="4"
      />
    </l-map>
    <div v-else class="no-map-data">
      <p>🗺️ Dados de mapa não disponíveis para esta atividade.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LPolyline } from "@vue-leaflet/vue-leaflet";
import polyline from '@mapbox/polyline';
import { latLngBounds } from 'leaflet';

const props = defineProps({
  mapPolyline: {
    type: String,
    default: ''
  }
});

const zoom = ref(13);

const path = computed(() => {
  if (!props.mapPolyline) return [];
  // A polyline do Strava precisa ter os escapes de `\` trocados
  return polyline.decode(props.mapPolyline.replace(/\\\\/g, '\\'));
});

const bounds = computed(() => {
  return path.value.length > 0 ? latLngBounds(path.value) : null;
});

const center = computed(() => {
  return bounds.value ? bounds.value.getCenter() : [0, 0];
});
</script>

<style scoped>
.no-map-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #ecf0f1;
  color: #7f8c8d;
  font-size: 1.2em;
}
</style>