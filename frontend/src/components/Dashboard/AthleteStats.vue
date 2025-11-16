<template>
  <div class="athlete-stats">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💪</div>
        <div class="stat-content">
          <h3 class="stat-label">FTP</h3>
          <p class="stat-value">{{ stats.ftp || '-' }}<span class="stat-unit">W</span></p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⚖️</div>
        <div class="stat-content">
          <h3 class="stat-label">Peso</h3>
          <p class="stat-value">{{ stats.weight || '-' }}<span class="stat-unit">kg</span></p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3 class="stat-label">W/kg</h3>
          <p class="stat-value">{{ wattsPerKg }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <h3 class="stat-label">Treinos Criados</h3>
          <p class="stat-value">{{ stats.workoutCount || 0 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'AthleteStats',
  props: {
    stats: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  setup(props) {
    const wattsPerKg = computed(() => {
      if (props.stats.ftp && props.stats.weight) {
        return (props.stats.ftp / props.stats.weight).toFixed(2)
      }
      return '-'
    })

    return {
      wattsPerKg
    }
  }
}
</script>

<style scoped>
.athlete-stats {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: var(--surface-color);
  padding: 20px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2.5em;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.85em;
  color: var(--text-secondary);
  margin: 0 0 5px 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.8em;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
  line-height: 1;
}

.stat-unit {
  font-size: 0.6em;
  color: var(--text-secondary);
  font-weight: normal;
  margin-left: 2px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 1.5em;
  }
}
</style>
