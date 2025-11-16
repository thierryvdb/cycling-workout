<template>
  <div class="history-page">
    <div class="page-header">
      <h1>📜 Histórico de Atividades</h1>
      <p>Veja todas as suas atividades sincronizadas do Strava.</p>
    </div>

    <div v-if="activityStore.isLoading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Carregando seu histórico de atividades...</p>
    </div>

    <div v-else-if="activities.length === 0" class="empty-state">
      <h2>Nenhuma Atividade Encontrada</h2>
      <p>Parece que você ainda não tem atividades sincronizadas.</p>
      <p>Conecte sua conta Strava no seu perfil para começar a sincronizar.</p>
      <router-link to="/profile" class="btn btn-primary">Ir para o Perfil</router-link>
    </div>

    <div v-else class="activities-table-container">
      <table class="activities-table">
        <thead>
          <tr>
            <th>Nome da Atividade</th>
            <th>Data</th>
            <th>Distância</th>
            <th>Tempo</th>
            <th>Elevação</th>
            <th>Potência Média</th>
            <th>TSS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in activities" :key="activity.id">
            <td>
              <span class="activity-type-icon">{{ getActivityIcon(activity.type) }}</span>
              <span class="activity-name">{{ activity.name }}</span>
            </td>
            <td>{{ formatDate(activity.start_date) }}</td>
            <td>{{ formatDistance(activity.distance) }}</td>
            <td>{{ formatTime(activity.moving_time) }}</td>
            <td>{{ formatElevation(activity.total_elevation_gain) }}</td>
            <td>{{ formatPower(activity.average_watts) }}</td>
            <td>{{ activity.tss || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useActivityStore } from '@/stores/activityStore';
import {
  formatDate,
  formatDistance,
  formatTime,
  formatElevation,
  formatPower,
} from '@/utils/formatters';

const activityStore = useActivityStore();

const activities = computed(() => activityStore.activities);

onMounted(() => {
  if (activities.value.length === 0) {
    activityStore.fetchActivities();
  }
});

const getActivityIcon = (type) => {
  switch (type) {
    case 'Ride': return '🚴';
    case 'Run': return '🏃';
    case 'Swim': return '🏊';
    case 'Hike': return '🥾';
    default: return '‍🏋️';
  }
};
</script>

<style scoped>
.history-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 10px 0;
}

.loading-indicator, .empty-state {
  text-align: center;
  padding: 50px;
  background: #f8f9fa;
  border-radius: 8px;
}

.activities-table-container {
  overflow-x: auto;
}

.activities-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.activities-table th, .activities-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #ecf0f1;
}

.activities-table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.activities-table tbody tr:hover {
  background-color: #f9f9f9;
}

.activity-name {
  font-weight: 500;
}

.activity-type-icon {
  margin-right: 8px;
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