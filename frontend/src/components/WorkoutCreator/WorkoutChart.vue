<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps({
  blocks: Array,
  user: Object,
});

const chartData = computed(() => {
  const labels = [];
  const powerData = [];
  let currentTime = 0;

  props.blocks.forEach(block => {
    labels.push(`${currentTime} min`);
    powerData.push(block.powerTarget);
    currentTime += block.duration;
    labels.push(`${currentTime} min`);
    powerData.push(block.powerTarget);
  });

  return {
    labels,
    datasets: [
      {
        label: 'Potência (W)',
        backgroundColor: '#3498db33',
        borderColor: '#3498db',
        data: powerData,
        stepped: true,
        fill: true,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Potência (W)',
      },
    },
    x: {
      title: {
        display: true,
        text: 'Tempo (minutos)',
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
}));
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 250px;
  width: 100%;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
</style>