<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>📊 Dashboard</h1>
      <p class="welcome-message">
        Olá, {{ currentUser.name }}! 👋 
        <span v-if="currentUser.ftp">Seu FTP atual é {{ currentUser.ftp }}W</span>
      </p>
    </div>

    <!-- Componente de estatísticas gerais do atleta -->
    <athlete-stats :stats="currentUser" />

    <!-- Widget de TSS Semanal -->
    <weekly-tss-widget />

    <div class="dashboard-content">
      <div class="quick-actions-section">
        <h2>⚡ Ações Rápidas</h2>
        <div class="quick-actions">
          <router-link to="/builder" class="action-card new-workout">
            <div class="action-icon">➕</div>
            <div class="action-content">
              <h3>Novo Treino</h3>
              <p>Crie um treino personalizado do zero</p>
            </div>
          </router-link>

          <router-link to="/history" class="action-card history">
            <div class="action-icon">📝</div>
            <div class="action-content">
              <h3>Ver Histórico</h3>
              <p>Revise seus treinos anteriores</p>
            </div>
          </router-link>

          <div class="action-card templates" @click="showTemplates">
            <div class="action-icon">🎯</div>
            <div class="action-content">
              <h3>Templates</h3>
              <p>Use modelos pré-definidos</p>
            </div>
          </div>

          <router-link to="/profile" class="action-card profile">
            <div class="action-icon">👤</div>
            <div class="action-content">
              <h3>Meu Perfil</h3>
              <p>Atualize seus dados</p>
            </div>
          </router-link>
        </div>
      </div>

      <div class="recent-workouts-section">
        <div class="section-header">
          <h2>🕐 Treinos Recentes</h2>
          <router-link to="/history" class="view-all-link">
            Ver todos →
          </router-link>
        </div>

        <div class="workouts-list">
          <div 
            v-for="workout in recentWorkouts" 
            :key="workout.id"
            class="workout-card"
            @click="editWorkout(workout.id)"
          >
            <div class="workout-header">
              <h3 class="workout-name">{{ workout.name }}</h3>
              <span class="workout-date">{{ formatDate(workout.created_at) }}</span>
            </div>
            
            <div class="workout-stats">
              <div class="workout-stat">
                <span class="stat-icon">⏱️</span>
                <span>{{ workout.total_duration }}min</span>
              </div>
              <div class="workout-stat">
                <span class="stat-icon">🔥</span>
                <span>{{ workout.total_tss }} TSS</span>
              </div>
              <div class="workout-stat">
                <span class="stat-icon">📊</span>
                <span>{{ workout.block_count }} blocos</span>
              </div>
            </div>

            <div class="workout-actions">
              <button 
                @click.stop="exportWorkout(workout.id, 'zwo')"
                class="btn-export"
                title="Exportar para Zwift"
              >
                🚴 .ZWO
              </button>
              <button 
                @click.stop="exportWorkout(workout.id, 'fit')"
                class="btn-export"
                title="Exportar para Garmin"
              >
                ⌚ .FIT
              </button>
            </div>
          </div>

          <div v-if="recentWorkouts.length === 0" class="empty-state">
            <div class="empty-icon">🚴‍♂️</div>
            <h3>Nenhum treino criado ainda</h3>
            <p>Comece criando seu primeiro treino!</p>
            <router-link to="/builder" class="btn-primary">
              Criar Primeiro Treino
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workoutStore'
import AthleteStats from '@/components/Dashboard/AthleteStats.vue'
import WeeklyTSSWidget from '@/components/Dashboard/WeeklyTSSWidget.vue'

export default {
  name: 'Dashboard',
  components: {
    AthleteStats,
    WeeklyTSSWidget
  },
  setup() {
    const workoutStore = useWorkoutStore()
    const router = useRouter()

    const showTemplatesModal = ref(false)
    const currentUser = computed(() => workoutStore.currentUser)
    
    const recentWorkouts = computed(() => 
      workoutStore.workouts.slice(0, 4)
    )

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    }

    const editWorkout = (workoutId) => {
      router.push(`/builder/${workoutId}`)
    }

    const exportWorkout = async (workoutId, format) => {
      try {
        await workoutStore.exportWorkout(workoutId, format)
      } catch (error) {
        console.error('Erro ao exportar:', error)
      }
    }

    const showTemplates = () => {
      showTemplatesModal.value = true
    }

    onMounted(() => {
      if (workoutStore.workouts.length === 0) {
        workoutStore.loadWorkouts()
      }
    })

    return {
      showTemplatesModal,
      currentUser,
      recentWorkouts,
      formatDate,
      editWorkout,
      exportWorkout,
      showTemplates
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px 0;
}

.dashboard-header h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #3498db, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-message {
  font-size: 1.1em;
  color: var(--text-secondary);
}

.dashboard-content {
  display: grid;
  gap: 40px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: var(--surface-color);
  padding: 25px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border-left: 4px solid;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.action-card.new-workout {
  border-left-color: #3498db;
}

.action-card.history {
  border-left-color: #2ecc71;
}

.action-card.templates {
  border-left-color: #e74c3c;
}

.action-card.profile {
  border-left-color: #9b59b6;
}

.action-icon {
  font-size: 2em;
  margin-bottom: 10px;
}

.action-content h3 {
  margin-bottom: 8px;
  color: var(--text-primary);
}

.action-content p {
  color: var(--text-secondary);
  font-size: 0.9em;
  line-height: 1.4;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: var(--text-primary);
}

.view-all-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: var(--secondary-color);
}

.workouts-list {
  display: grid;
  gap: 15px;
}

.workout-card {
  background: var(--surface-color);
  padding: 20px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 4px solid var(--primary-color);
}

.workout-card:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.workout-name {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1em;
}

.workout-date {
  color: var(--text-secondary);
  font-size: 0.85em;
}

.workout-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.workout-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-size: 0.9em;
}

.stat-icon {
  font-size: 1.1em;
}

.workout-actions {
  display: flex;
  gap: 10px;
}

.btn-export {
  padding: 6px 12px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--surface-color);
  border-radius: var(--border-radius);
  border: 2px dashed var(--border-color);
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.btn-primary {
  display: inline-block;
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: var(--secondary-color);
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .workout-header {
    flex-direction: column;
    gap: 5px;
  }

  .workout-stats {
    flex-wrap: wrap;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header h1 {
    font-size: 2em;
  }
}
</style>