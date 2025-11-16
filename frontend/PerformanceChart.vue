<template>
  <div class="chart-wrapper">
    <Line v-if="chartData.datasets[0].data.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="no-chart-data">
      <p>{{ icon }} Dados de {{ title.toLowerCase() }} não disponíveis.</p>
    </div>
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    required: true,
  },
  title: String,
  icon: String,
});
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  height: 250px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}
.no-chart-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #7f8c8d;
}
</style>