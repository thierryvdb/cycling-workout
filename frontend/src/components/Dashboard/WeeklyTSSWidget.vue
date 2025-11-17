<template>
  <div class="weekly-tss-widget">
    <div class="widget-header">
      <h3>📊 TSS Semanal</h3>
      <div class="week-nav">
        <button @click="previousWeek" class="btn-nav">←</button>
        <span class="week-label">{{ weekLabel }}</span>
        <button @click="nextWeek" class="btn-nav" :disabled="isCurrentWeek">→</button>
      </div>
    </div>

    <div class="tss-summary">
      <div class="tss-total">
        <span class="tss-value">{{ weeklyTSS }}</span>
        <span class="tss-label">TSS Total</span>
      </div>
      <div class="tss-stats">
        <div class="stat-item">
          <span class="stat-icon">🎯</span>
          <div>
            <div class="stat-value">{{ targetTSS }}</div>
            <div class="stat-label">Meta</div>
          </div>
        </div>
        <div class="stat-item">
          <span class="stat-icon">📈</span>
          <div>
            <div class="stat-value" :class="progressClass">{{ progressPercentage }}%</div>
            <div class="stat-label">Progresso</div>
          </div>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⏱️</span>
          <div>
            <div class="stat-value">{{ totalHours }}h</div>
            <div class="stat-label">Duração</div>
          </div>
        </div>
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <div class="daily-breakdown">
      <div
        v-for="(day, index) in dailyData"
        :key="index"
        class="day-bar"
        :title="`${day.name}: ${day.tss} TSS`"
      >
        <div class="bar-fill" :style="{ height: (day.tss / maxDayTSS * 100) + '%' }">
          <span class="bar-value" v-if="day.tss > 0">{{ day.tss }}</span>
        </div>
        <span class="day-label">{{ day.shortName }}</span>
      </div>
    </div>

    <div class="widget-footer">
      <div class="recommendation" v-if="recommendation">
        <span class="rec-icon">💡</span>
        <span>{{ recommendation }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWorkoutStore } from '@/stores/workoutStore'

const workoutStore = useWorkoutStore()

const currentWeekOffset = ref(0)
const targetTSS = ref(500) // Meta semanal configurável

// Calcula início e fim da semana
const getWeekDates = (offset = 0) => {
  const now = new Date()
  const currentDay = now.getDay()
  const diff = currentDay === 0 ? -6 : 1 - currentDay // Monday as first day

  const monday = new Date(now)
  monday.setDate(now.getDate() + diff + (offset * 7))
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return { start: monday, end: sunday }
}

const weekDates = computed(() => getWeekDates(currentWeekOffset.value))

const weekLabel = computed(() => {
  const { start, end } = weekDates.value
  const startStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  return `${startStr} - ${endStr}`
})

const isCurrentWeek = computed(() => currentWeekOffset.value === 0)

// Dados fictícios - em produção, buscar do backend
const workoutsThisWeek = computed(() => {
  // TODO: Filtrar workouts da semana atual do store
  // workoutStore.workouts.filter(w => isInWeek(w.created_at))
  return []
})

const weeklyTSS = computed(() => {
  // Simulação - em produção calcular dos workouts reais
  return Math.floor(Math.random() * 600)
})

const totalHours = computed(() => {
  return Math.floor(weeklyTSS.value / 50) // Aproximação: ~50 TSS/hora
})

const progressPercentage = computed(() => {
  const percentage = (weeklyTSS.value / targetTSS.value) * 100
  return Math.min(Math.round(percentage), 100)
})

const progressClass = computed(() => {
  const progress = progressPercentage.value
  if (progress >= 100) return 'progress-complete'
  if (progress >= 75) return 'progress-good'
  if (progress >= 50) return 'progress-medium'
  return 'progress-low'
})

// Dados diários (Segunda a Domingo)
const dailyData = computed(() => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const fullNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  // Simulação - em produção, calcular TSS real por dia
  return days.map((shortName, index) => ({
    shortName,
    name: fullNames[index],
    tss: Math.floor(Math.random() * 150)
  }))
})

const maxDayTSS = computed(() => {
  return Math.max(...dailyData.value.map(d => d.tss), 100)
})

const recommendation = computed(() => {
  const progress = progressPercentage.value
  const remaining = targetTSS.value - weeklyTSS.value

  if (progress >= 100) {
    return '🎉 Meta semanal atingida! Considere um dia de recuperação.'
  }
  if (progress >= 80) {
    return `Faltam ${remaining} TSS. Você está quase lá!`
  }
  if (progress >= 50) {
    return `Faltam ${remaining} TSS. Continue firme!`
  }
  if (progress < 30) {
    return '⚠️ Carga baixa esta semana. Planeje treinos para atingir sua meta.'
  }
  return null
})

const previousWeek = () => {
  currentWeekOffset.value--
}

const nextWeek = () => {
  if (!isCurrentWeek.value) {
    currentWeekOffset.value++
  }
}

onMounted(() => {
  // Carregar dados se necessário
  if (workoutStore.workouts.length === 0) {
    workoutStore.loadWorkouts()
  }
})
</script>

<style scoped>
.weekly-tss-widget {
  background: var(--surface-color);
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.widget-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2em;
}

.week-nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-nav {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-nav:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.week-label {
  font-size: 0.9em;
  color: var(--text-secondary);
  min-width: 140px;
  text-align: center;
}

.tss-summary {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.tss-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 25px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 8px;
  color: white;
}

.tss-value {
  font-size: 2.5em;
  font-weight: bold;
  line-height: 1;
}

.tss-label {
  font-size: 0.8em;
  opacity: 0.9;
  margin-top: 5px;
}

.tss-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: var(--background-color);
  border-radius: 6px;
}

.stat-icon {
  font-size: 1.5em;
}

.stat-value {
  font-size: 1.2em;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.75em;
  color: var(--text-secondary);
}

.progress-low { color: #e74c3c; }
.progress-medium { color: #f39c12; }
.progress-good { color: #3498db; }
.progress-complete { color: #27ae60; }

.progress-bar {
  height: 8px;
  background: var(--background-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.5s ease;
}

.daily-breakdown {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 15px;
  height: 120px;
  align-items: flex-end;
}

.day-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  transition: all 0.3s ease;
  position: relative;
}

.bar-fill:hover {
  opacity: 0.8;
  transform: scaleY(1.05);
}

.bar-value {
  font-size: 0.7em;
  font-weight: 600;
  color: white;
}

.day-label {
  font-size: 0.75em;
  color: var(--text-secondary);
  font-weight: 500;
}

.widget-footer {
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
}

.recommendation {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--background-color);
  border-left: 3px solid var(--primary-color);
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--text-primary);
}

.rec-icon {
  font-size: 1.2em;
}

@media (max-width: 768px) {
  .tss-summary {
    grid-template-columns: 1fr;
  }

  .tss-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .stat-item {
    flex-direction: column;
    text-align: center;
  }

  .daily-breakdown {
    height: 100px;
  }

  .bar-value {
    display: none;
  }
}
</style>
