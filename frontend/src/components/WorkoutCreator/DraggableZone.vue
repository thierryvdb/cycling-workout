<template>
  <div
    class="draggable-zone"
    draggable="true"
    @dragstart="onDragStart"
    :style="{ borderLeftColor: zone.color || '#3498db' }"
  >
    <span class="zone-name">{{ zone.name }}</span>
    <span class="zone-value">{{ zone.min }} - {{ zone.max }} {{ unit }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  zone: Object,
  type: String, // 'power' ou 'hr'
});

const unit = computed(() => (props.type === 'power' ? 'W' : 'bpm'));

const onDragStart = (e) => {
  const payload = {
    type: props.type,
    data: props.zone,
  };
  e.dataTransfer.setData('application/json', JSON.stringify(payload));
  e.dataTransfer.effectAllowed = 'copy';
};
</script>

<style scoped>
.draggable-zone {
  padding: 10px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid;
  cursor: grab;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.draggable-zone:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.zone-name { font-weight: 500; }
.zone-value { color: #7f8c8d; font-size: 0.9em; }
</style>