<template>
  <div class="activity-detail-page">
    <div v-if="activityStore.isLoading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Carregando detalhes da atividade...</p>
    </div>

    <div v-else-if="activityStore.error" class="error-message">
      <h2>❌ Erro ao Carregar</h2>
      <p>{{ activityStore.error }}</p>
      <router-link to="/history" class="btn btn-primary">Voltar para o Histórico</router-link>
    </div>

    <div v-else-if="activity" class="activity-content">
      <div class="page-header">
        <h1>{{ activity.name }}</h1>
        <p>{{ formatDate(activity.start_date) }}</p>
      </div>

      <div class="summary-grid">
        <div class="summary-item">
          <span class="label">Distância</span>
          <span class="value">{{ formatDistance(activity.distance) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Tempo</span>
          <span class="value">{{ formatTime(activity.moving_time) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Elevação</span>
          <span class="value">{{ formatElevation(activity.total_elevation_gain) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Potência Média</span>
          <span class="value">{{ formatPower(activity.average_watts) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">TSS</span>
          <span class="value">{{ activity.tss || 'N/A' }}</span>
        </div>
      </div>

      <div class="map-container">
        <ActivityMap :map-polyline="activity.map_polyline" />
      </div>

      <div class="charts-container">
        <h2>Gráficos de Desempenho</h2>
        <PerformanceChart
          title="Potência"
          icon="⚡"
          :chart-data="powerChartData"
          :chart-options="powerChartOptions"
        />
        <PerformanceChart
          title="Frequência Cardíaca"
          icon="❤️"
          :chart-data="hrChartData"
          :chart-options="hrChartOptions"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useActivityStore } from '@/stores/activityStore';
import ActivityMap from '@/components/ActivityMap.vue';
import PerformanceChart from '@/components/PerformanceChart.vue';
import {
  formatDate as formatDateUtil,
  formatDistance,
  formatTime as formatTimeUtil,
  formatElevation,
  formatPower,
} from '@/utils/formatters';

const props = defineProps({
  activityId: {
    type: String,
    required: true,
  },
});

const activityStore = useActivityStore();
const activity = computed(() => activityStore.currentActivity);
const streams = computed(() => activityStore.activityStreams);

onMounted(() => {
  activityStore.fetchActivityDetails(props.activityId);
});

// Funções de formatação usando o utilitário
const formatDate = (dateString) => {
  return formatDateUtil(dateString, { style: 'long' });
};

const formatTime = (timeInSeconds) => {
  // A página de detalhes pode mostrar mais precisão
  const formatted = formatTimeUtil(timeInSeconds);
  const seconds = timeInSeconds % 60;
  return `${formatted} ${seconds}s`;
};
</script>

<style scoped>
.activity-detail-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.loading-indicator, .error-message {
  text-align: center;
  padding: 50px;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.page-header h1 {
  margin: 0;
}

.page-header p {
  margin: 5px 0 0;
  color: #7f8c8d;
  font-size: 1.1em;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  text-align: center;
}

.summary-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.summary-item .label {
  display: block;
  font-size: 0.9em;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.summary-item .value {
  font-size: 1.8em;
  font-weight: 600;
  color: #2c3e50;
}

.map-container, .charts-container {
  margin-bottom: 30px;
}

.charts-container {
  margin-bottom: 15px;
  display: grid;
  gap: 20px;
}

.charts-container h2 {
  margin-bottom: 15px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
  margin-top: 20px;
}

.btn-primary {
  background: #3498db;
  color: white;
}
</style>
```

### 2. Atualização do Store de Atividades (`activityStore.js`)

Adicionei o estado `currentActivity` e a ação `fetchActivityDetails` para buscar os dados da atividade específica.

```diff
--- a/backend/activityStore.js
+++ b/backend/activityStore.js