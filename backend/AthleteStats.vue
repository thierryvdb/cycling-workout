<template>
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-icon">🚴</div>
      <div class="metric-info">
        <div class="metric-value">{{ stats.total_activities || 0 }}</div>
        <div class="metric-label">Atividades Totais</div>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-icon">🗺️</div>
      <div class="metric-info">
        <div class="metric-value">{{ formatDistance(stats.total_distance) }}</div>
        <div class="metric-label">Distância Total</div>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-icon">⏱️</div>
      <div class="metric-info">
        <div class="metric-value">{{ formatTime(stats.total_time) }}</div>
        <div class="metric-label">Tempo Total</div>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-icon">🗓️</div>
      <div class="metric-info">
        <div class="metric-value">{{ lastActivityDate }}</div>
        <div class="metric-label">Última Atividade</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      total_activities: 0,
      total_distance: 0,
      total_time: 0,
      last_activity_date: null,
    }),
  },
});

const formatDistance = (distanceInMeters) => {
  if (!distanceInMeters) return '0 km';
  return `${(distanceInMeters / 1000).toFixed(0)} km`;
};

const formatTime = (timeInSeconds) => {
  if (!timeInSeconds) return '0h';
  return `${Math.round(timeInSeconds / 3600)}h`;
};

const lastActivityDate = computed(() => {
  if (!props.stats.last_activity_date) return 'N/A';
  return new Date(props.stats.last_activity_date).toLocaleDateString('pt-BR');
});
</script>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.metric-card {
  background: var(--surface-color);
  padding: 25px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
}

.metric-icon { font-size: 2em; }
.metric-value {
  font-size: 2em;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}
.metric-label {
  color: var(--text-secondary);
  font-size: 0.9em;
  margin-top: 5px;
}
</style>