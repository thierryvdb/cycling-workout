<template>
  <div class="workout-builder">
    <div class="builder-header">
      <h1>{{ isEditing ? '✏️ Editor de Treino' : '🏋️ Construtor de Treinos' }}</h1>
      <div class="workout-info">
        <input 
          v-model="workoutName" 
          placeholder="Nome do treino"
          class="workout-name-input"
        >
        <div class="workout-stats">
          <span>⏱️ {{ totalDuration }}min</span>
          <span>🔥 {{ totalTSS }} TSS</span>
          <span>⚡ {{ totalPower }}W avg</span>
        </div>
      </div>
    </div>

    <div class="builder-container">
      <div class="zones-panel">
        <h3>🎯 Zonas de Treino</h3>
        
        <div class="zones-group">
          <h4>⚡ Potência</h4>
          <draggable-zone
            v-for="zone in powerZones"
            :key="zone.id"
            :zone="zone"
            :user-ftp="currentUser.ftp"
            type="power"
          />
        </div>

        <div class="zones-group">
          <h4>❤️ Frequência Cardíaca</h4>
          <draggable-zone
            v-for="zone in heartRateZones"
            :key="zone.id"
            :zone="zone"
            :user-ftp="currentUser.max_heart_rate"
            type="hr"
          />
        </div>

        <div class="zones-group">
          <h4>🔄 Cadência</h4>
          <div class="cadence-options">
            <div
              v-for="cadence in cadenceOptions"
              :key="cadence.id"
              class="cadence-option draggable"
              draggable="true"
              @dragstart="onCadenceDragStart(cadence)"
              :style="{ borderLeftColor: cadence.color }"
            >
              <span class="cadence-name">{{ cadence.name }}</span>
              <span class="cadence-rpm">{{ cadence.target }}rpm</span>
            </div>
          </div>
        </div>
      </div>

      <div class="timeline-container">
        <h3>📈 Timeline do Treino</h3>
        
        <div
          class="timeline-dropzone"
          @drop="onTimelineDrop"
          @dragover="onDragOver"
          @dragenter="onDragEnter"
          @dragleave="onDragLeave"
          :class="{ 'drag-active': isDragActive }"
        >
          <div v-if="workoutBlocks.length === 0" class="empty-timeline">
            <div class="empty-message">
              <span>🎯 Arraste zonas para cá para começar</span>
              <p>Solte zonas de potência, cadência e intervalos aqui</p>
            </div>
          </div>

          <draggable
            v-else
            v-model="workoutBlocks"
            class="timeline-blocks"
            item-key="id"
            @end="onBlockReorder"
          >
            <template #item="{ element: block, index }">
              <workout-block
                :block="block"
                :index="index"
                @update="updateBlock"
                @remove="removeBlock"
                @duplicate="duplicateBlock"
              />
            </template>
          </draggable>
        </div>

        <div class="workout-summary">
          <h4>📊 Resumo do Treino</h4>
          <workout-chart :blocks="workoutBlocks" :user="currentUser" />
          
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Duração Total:</span>
              <span class="stat-value">{{ totalDuration }} minutos</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">TSS Estimado:</span>
              <span class="stat-value">{{ totalTSS }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Potência Média:</span>
              <span class="stat-value">{{ Math.round(avgPower) }}W</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Cadência Média:</span>
              <span class="stat-value">{{ Math.round(avgCadence) }}rpm</span>
            </div>
          </div>
        </div>
      </div>

      <div class="controls-panel">
        <h3>⚙️ Controles</h3>
        
        <div class="duration-controls">
          <label>Duração do Bloco (minutos):</label>
          <input
            type="number"
            v-model="blockDuration"
            min="1"
            max="60"
            class="duration-input"
          >
        </div>

        <div class="action-buttons">
          <button @click="addEmptyBlock" class="btn btn-secondary">
            + Add Bloco Vazio
          </button>
          <button @click="clearWorkout" class="btn btn-outline">
            🗑️ Limpar Tudo
          </button>
          <button @click="saveWorkout" class="btn btn-primary" :disabled="!canSave">
            💾 Salvar Treino
          </button>
        </div>

        <div class="export-section" v-if="workoutBlocks.length > 0">
          <h4>📤 Exportar</h4>
          <div class="export-buttons">
            <button @click="exportWorkout('zwo')" class="export-btn zwift">
              🚴 .ZWO (Zwift)
            </button>
            <button @click="exportWorkout('fit')" class="export-btn garmin">
              ⌚ .FIT (Garmin)
            </button>
            <button @click="exportWorkout('erg')" class="export-btn trainer">
              🏠 .ERG (Trainer)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkoutStore } from '@/stores/workoutStore'
import Draggable from 'vuedraggable'
import WorkoutBlock from '@/components/WorkoutCreator/WorkoutBlock.vue'
import DraggableZone from '@/components/WorkoutCreator/DraggableZone.vue'
import WorkoutChart from '@/components/WorkoutCreator/WorkoutChart.vue'
import { calculateTSS, calculatePowerZones } from '@/utils/workoutCalculations'

import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'WorkoutBuilder',
  components: {
    Draggable,
    WorkoutBlock,
    DraggableZone,
    WorkoutChart
  },
  props: {
    workoutId: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const workoutStore = useWorkoutStore()
    const route = useRoute()
    const router = useRouter()
    
    const workoutName = ref('Novo Treino')
    const blockDuration = ref(5)
    const isDragActive = ref(false)
    const draggedItem = ref(null)
    
    const workoutBlocks = ref([])
    let blockIdCounter = 0

    const isEditing = computed(() => !!props.workoutId)

    const powerZones = computed(() => calculatePowerZones(workoutStore.currentUser.ftp))

    const cadenceOptions = [
      { id: 'recovery', name: 'Recuperação', target: 80, min: 70, max: 85, color: '#4CAF50' },
      { id: 'endurance', name: 'Endurance', target: 90, min: 85, max: 95, color: '#8BC34A' },
      { id: 'tempo', name: 'Tempo', target: 95, min: 90, max: 100, color: '#FFC107' },
      { id: 'threshold', name: 'Threshold', target: 100, min: 95, max: 105, color: '#FF9800' },
      { id: 'vo2max', name: 'VO2 Max', target: 105, min: 100, max: 110, color: '#F44336' },
      { id: 'high_cadence', name: 'Alta Cadência', target: 110, min: 105, max: 120, color: '#9C27B0' }
    ]

    const heartRateZones = computed(() => {
      const maxHr = workoutStore.currentUser.max_heart_rate || 180 // Default max HR
      return [
        { id: 'z1', name: 'Z1', min: Math.round(maxHr * 0.5), max: Math.round(maxHr * 0.6) },
        { id: 'z2', name: 'Z2', min: Math.round(maxHr * 0.6), max: Math.round(maxHr * 0.7) },
        { id: 'z3', name: 'Z3', min: Math.round(maxHr * 0.7), max: Math.round(maxHr * 0.8) },
      ]
    })

    const totalDuration = computed(() => 
      workoutBlocks.value.reduce((total, block) => total + block.duration, 0)
    )

    const totalTSS = computed(() => 
      workoutBlocks.value.reduce((total, block) => 
        total + calculateTSS(block, workoutStore.currentUser.ftp), 0
      )
    )

    const avgPower = computed(() => {
      const totalPowerTime = workoutBlocks.value.reduce((total, block) => 
        total + (block.powerTarget * block.duration), 0
      )
      return totalDuration.value > 0 ? totalPowerTime / totalDuration.value : 0
    })

    const avgCadence = computed(() => {
      const totalCadenceTime = workoutBlocks.value.reduce((total, block) => 
        total + (block.cadenceTarget * block.duration), 0
      )
      return totalDuration.value > 0 ? totalCadenceTime / totalDuration.value : 0
    })

    const totalPower = computed(() => Math.round(avgPower.value))

    const canSave = computed(() => 
      workoutBlocks.value.length > 0 && workoutName.value.trim() !== ''
    )

    const currentUser = computed(() => workoutStore.currentUser)

    const generateBlockId = () => `block_${++blockIdCounter}`

    const createEmptyBlock = () => ({
      id: generateBlockId(),
      duration: blockDuration.value,
      zoneType: 'endurance',
      powerTarget: workoutStore.currentUser.ftp * 0.7,
      powerMin: workoutStore.currentUser.ftp * 0.65,
      powerMax: workoutStore.currentUser.ftp * 0.75,
      cadenceTarget: 90,
      cadenceMin: 85,
      cadenceMax: 95,
      hrMin: null,
      hrMax: null,
      terrain: null,
      notes: ''
    })

    const onCadenceDragStart = (cadence) => {
      draggedItem.value = { type: 'cadence', data: cadence }
    }

    const onDragOver = (e) => {
      e.preventDefault()
      isDragActive.value = true
    }

    const onDragEnter = (e) => {
      e.preventDefault()
      isDragActive.value = true
    }

    const onDragLeave = (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        isDragActive.value = false
      }
    }

    const onTimelineDrop = (e) => {
      e.preventDefault()
      isDragActive.value = false
      
      const droppedItem = JSON.parse(e.dataTransfer.getData('application/json') || '{}')
      if (!droppedItem.type) return

      const newBlock = createEmptyBlock()
      
      if (droppedItem.type === 'power') {
        newBlock.powerMin = droppedItem.data.min
        newBlock.powerMax = droppedItem.data.max
        newBlock.powerTarget = Math.round((droppedItem.data.min + droppedItem.data.max) / 2)
      } else if (droppedItem.type === 'hr') {
        newBlock.hrMin = droppedItem.data.min
        newBlock.hrMax = droppedItem.data.max
      }
      else if (draggedItem.value.type === 'cadence') {
        const cadence = draggedItem.value.data
        newBlock.cadenceTarget = cadence.target
        newBlock.cadenceMin = cadence.min
        newBlock.cadenceMax = cadence.max
      }

      workoutBlocks.value.push(newBlock)
    }

    const addEmptyBlock = () => {
      workoutBlocks.value.push(createEmptyBlock())
    }

    const removeBlock = (index) => {
      workoutBlocks.value.splice(index, 1)
    }

    const updateBlock = (index, updatedBlock) => {
      workoutBlocks.value[index] = { ...updatedBlock }
    }

    const duplicateBlock = (index) => {
      const blockToDuplicate = { ...workoutBlocks.value[index] }
      blockToDuplicate.id = generateBlockId()
      workoutBlocks.value.splice(index + 1, 0, blockToDuplicate)
    }

    const onBlockReorder = () => {
      // Recalcula tempos se necessário
    }

    const clearWorkout = () => {
      workoutBlocks.value = []
      workoutName.value = 'Novo Treino'
    }

    const saveWorkout = async () => {
      try {
        const workoutData = {
          name: workoutName.value,
          blocks: workoutBlocks.value,
          totalDuration: totalDuration.value,
          totalTSS: totalTSS.value
        }

        if (isEditing.value) {
          await workoutStore.updateWorkout(props.workoutId, workoutData)
        } else {
          const newWorkout = await workoutStore.saveWorkout(workoutData)
          if (newWorkout && newWorkout.id) {
            router.replace(`/builder/${newWorkout.id}`)
          }
        }
        
        window.showNotification('success', 'Sucesso!', `Treino "${workoutName.value}" foi salvo.`)
      } catch (error) {
        window.showNotification('error', 'Erro ao Salvar', error.message)
      }
    }

    const exportWorkout = async (format) => {
      if (!isEditing.value) {
        window.showNotification('warning', 'Aviso', 'Você precisa salvar o treino antes de exportar.')
        return
      }
      try {
        await workoutStore.exportWorkout(
          props.workoutId, 
          format
        )
      } catch (error) {
        window.showNotification('error', 'Erro ao Exportar', error.message)
      }
    }
    
    const loadWorkoutForEdit = async (id) => {
      const workout = await workoutStore.getWorkoutById(id)
      if (workout) {
        workoutName.value = workout.name
        // Garante que os blocos sejam reativos e tenham IDs únicos para o vuedraggable
        workoutBlocks.value = workout.blocks.map((b, index) => ({ ...b, id: `block_${index}` }))
        blockIdCounter = workout.blocks.length
      } else {
        router.push('/builder') // Redireciona se o treino não for encontrado
      }
    }

    onMounted(() => {
      if (props.workoutId) {
        loadWorkoutForEdit(props.workoutId)
      }
    })

    // Observa mudanças na rota para limpar o formulário ao sair do modo de edição
    watch(() => route.path, (newPath) => {
      if (newPath === '/builder') {
        clearWorkout()
      }
    })

    return {
      workoutName,
      blockDuration,
      isDragActive,
      workoutBlocks,
      powerZones,
      cadenceOptions,
      heartRateZones,
      totalDuration,
      totalTSS,
      avgPower,
      avgCadence,
      totalPower,
      canSave,
      currentUser,
      isEditing,
      onCadenceDragStart,
      onDragOver,
      onDragEnter,
      onDragLeave,
      onTimelineDrop,
      addEmptyBlock,
      removeBlock,
      updateBlock,
      duplicateBlock,
      onBlockReorder,
      clearWorkout,
      saveWorkout,
      exportWorkout
    }
  }
}
</script>

<style scoped>
.workout-builder {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.builder-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 20px;
}

.builder-header h1 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.workout-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.workout-name-input {
  padding: 10px 15px;
  border: 2px solid #3498db;
  border-radius: 8px;
  font-size: 1.1em;
  min-width: 300px;
}

.workout-stats {
  display: flex;
  gap: 20px;
  font-weight: bold;
  color: #7f8c8d;
}

.builder-container {
  display: grid;
  grid-template-columns: 300px 1fr 280px;
  gap: 20px;
  min-height: 600px;
}

.zones-panel {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.zones-group {
  margin-bottom: 25px;
}

.zones-group h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cadence-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cadence-option {
  padding: 10px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #3498db;
  cursor: grab;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
}

.cadence-option:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.cadence-name {
  font-weight: 500;
}

.cadence-rpm {
  color: #7f8c8d;
  font-size: 0.9em;
}

.timeline-container {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.timeline-dropzone {
  min-height: 200px;
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
  margin-bottom: 30px;
}

.timeline-dropzone.drag-active {
  border-color: #3498db;
  background: #ebf5fb;
}

.empty-timeline {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #7f8c8d;
  text-align: center;
}

.empty-message span {
  font-size: 1.1em;
  font-weight: 500;
}

.empty-message p {
  margin: 5px 0 0 0;
  font-size: 0.9em;
}

.timeline-blocks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.controls-panel {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.duration-controls {
  margin-bottom: 20px;
}

.duration-controls label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.duration-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 1em;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 25px;
}

.btn {
  padding: 12px 15px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #2ecc71;
  color: white;
}

.btn-secondary:hover {
  background: #27ae60;
}

.btn-outline {
  background: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
}

.btn-outline:hover {
  background: #e74c3c;
  color: white;
}

.export-section h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.export-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.export-btn {
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.export-btn.zwift {
  background: #f39c12;
  color: white;
}

.export-btn.garmin {
  background: #2c3e50;
  color: white;
}

.export-btn.trainer {
  background: #9b59b6;
  color: white;
}

.export-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.workout-summary {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.summary-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #ecf0f1;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9em;
}

.stat-value {
  font-weight: 600;
  color: #2c3e50;
}

@media (max-width: 1200px) {
  .builder-container {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "zones"
      "timeline"
      "controls";
  }
  
  .zones-panel {
    grid-area: zones;
    position: static;
  }
  
  .timeline-container {
    grid-area: timeline;
  }
  
  .controls-panel {
    grid-area: controls;
    position: static;
  }
}

@media (max-width: 768px) {
  .workout-info {
    flex-direction: column;
    align-items: stretch;
  }
  
  .workout-name-input {
    min-width: auto;
  }
  
  .workout-stats {
    justify-content: space-between;
  }
}
</style>