<template>
  <div
    class="workout-block"
    :class="{ 'compact-mode': !isExpanded, 'selected': isSelected }"
    @click="selectBlock"
    @keydown="handleKeydown"
    tabindex="0"
    ref="blockElement"
  >
    <div class="block-header">
      <span class="block-index">#{{ index + 1 }}</span>
      <div class="block-info" v-if="!isExpanded">
        <span class="quick-stat" @dblclick.stop="startQuickEdit('duration')">
          ⏱️ {{ editableBlock.duration }}min
        </span>
        <span class="quick-stat" @dblclick.stop="startQuickEdit('powerTarget')">
          ⚡ {{ editableBlock.powerTarget }}W
        </span>
        <span class="quick-stat" @dblclick.stop="startQuickEdit('cadenceTarget')" v-if="editableBlock.cadenceTarget">
          🔄 {{ editableBlock.cadenceTarget }}rpm
        </span>
      </div>
      <div class="block-actions">
        <button
          @click.stop="toggleExpanded"
          :title="isExpanded ? 'Compactar' : 'Expandir'"
          class="btn-expand"
        >
          {{ isExpanded ? '📐' : '📝' }}
        </button>
        <button @click.stop="$emit('duplicate', index)" title="Duplicar (Ctrl+D)">📋</button>
        <button @click.stop="$emit('remove', index)" title="Remover (Delete)" class="btn-remove">❌</button>
      </div>
    </div>

    <!-- Quick Edit Modal -->
    <div v-if="quickEditField" class="quick-edit-modal" @click.stop>
      <label>{{ quickEditLabels[quickEditField] }}</label>
      <input
        ref="quickEditInput"
        type="number"
        v-model.number="quickEditValue"
        @keydown.enter="saveQuickEdit"
        @keydown.esc="cancelQuickEdit"
        @blur="saveQuickEdit"
      />
      <div class="quick-edit-hint">Enter para salvar, Esc para cancelar</div>
    </div>

    <div class="block-content" v-show="isExpanded">
      <div class="form-group">
        <label>Duração (min)</label>
        <input type="number" v-model.number="editableBlock.duration" @change="onUpdate" />
      </div>
      <div class="form-group">
        <label>Potência Alvo (W)</label>
        <input type="number" v-model.number="editableBlock.powerTarget" @change="onUpdate" />
      </div>
      <div class="form-group">
        <label>Cadência Alvo (rpm)</label>
        <input type="number" v-model.number="editableBlock.cadenceTarget" @change="onUpdate" />
      </div>
      <div class="form-group range-group">
        <label>Faixa de Potência (W)</label>
        <div class="range-inputs">
          <input type="number" v-model.number="editableBlock.powerMin" placeholder="Min" @change="onUpdate" />
          <span>-</span>
          <input type="number" v-model.number="editableBlock.powerMax" placeholder="Max" @change="onUpdate" />
        </div>
      </div>
      <div class="form-group">
        <label>Tipo de Zona</label>
        <select v-model="editableBlock.zone_type" @change="onUpdate">
          <option value="warmup">Aquecimento</option>
          <option value="steady">Constante</option>
          <option value="interval">Intervalo</option>
          <option value="cooldown">Desaquecimento</option>
        </select>
      </div>
      <div class="form-group full-width">
        <label>Notas</label>
        <textarea v-model="editableBlock.notes" @change="onUpdate" placeholder="Ex: Aumentar cadência no final"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  block: Object,
  index: Number,
  isSelected: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update', 'remove', 'duplicate', 'select']);

const editableBlock = ref({ ...props.block });
const isExpanded = ref(false);
const quickEditField = ref(null);
const quickEditValue = ref(null);
const quickEditInput = ref(null);
const blockElement = ref(null);

const quickEditLabels = {
  duration: 'Duração (min)',
  powerTarget: 'Potência (W)',
  cadenceTarget: 'Cadência (rpm)'
};

watch(() => props.block, (newBlock) => {
  editableBlock.value = { ...newBlock };
}, { deep: true });

const onUpdate = () => {
  emit('update', props.index, editableBlock.value);
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const selectBlock = () => {
  emit('select', props.index);
  blockElement.value?.focus();
};

const startQuickEdit = async (field) => {
  quickEditField.value = field;
  quickEditValue.value = editableBlock.value[field] || '';
  await nextTick();
  quickEditInput.value?.focus();
  quickEditInput.value?.select();
};

const saveQuickEdit = () => {
  if (quickEditField.value && quickEditValue.value) {
    editableBlock.value[quickEditField.value] = quickEditValue.value;
    onUpdate();
  }
  cancelQuickEdit();
};

const cancelQuickEdit = () => {
  quickEditField.value = null;
  quickEditValue.value = null;
};

const handleKeydown = (event) => {
  // Delete key - remove block
  if (event.key === 'Delete' && !quickEditField.value) {
    event.preventDefault();
    emit('remove', props.index);
  }

  // Ctrl+D - duplicate block
  if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
    event.preventDefault();
    emit('duplicate', props.index);
  }

  // Enter - toggle expanded
  if (event.key === 'Enter' && !quickEditField.value) {
    event.preventDefault();
    toggleExpanded();
  }

  // E key - toggle expanded
  if (event.key === 'e' && !quickEditField.value) {
    event.preventDefault();
    toggleExpanded();
  }
};
</script>

<style scoped>
.workout-block {
  background: var(--surface-color);
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.2s ease;
  position: relative;
  outline: none;
}

.workout-block:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.workout-block.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.workout-block.compact-mode {
  padding: 10px 15px;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.compact-mode .block-header {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.block-index {
  font-weight: bold;
  color: var(--primary-color);
  font-size: 0.9em;
}

.block-info {
  display: flex;
  gap: 12px;
  flex: 1;
  margin: 0 15px;
}

.quick-stat {
  padding: 4px 10px;
  background: var(--background-color);
  border-radius: 4px;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.quick-stat:hover {
  background: var(--primary-color);
  color: white;
  transform: scale(1.05);
}

.block-actions {
  display: flex;
  gap: 5px;
}

.block-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1em;
  padding: 4px 8px;
  border-radius: 4px;
  opacity: 0.7;
  transition: all 0.2s;
}

.block-actions button:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}

.btn-remove:hover {
  background: rgba(231, 76, 60, 0.1);
}

.btn-expand:hover {
  background: rgba(52, 152, 219, 0.1);
}

/* Quick Edit Modal */
.quick-edit-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 200px;
}

.quick-edit-modal label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.quick-edit-modal input {
  width: 100%;
  padding: 10px;
  border: 2px solid var(--primary-color);
  border-radius: 4px;
  font-size: 1.1em;
}

.quick-edit-hint {
  margin-top: 8px;
  font-size: 0.75em;
  color: var(--text-secondary);
  text-align: center;
}

/* Block Content */
.block-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  font-size: 0.8em;
  margin-bottom: 5px;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group textarea {
  min-height: 60px;
  resize: vertical;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-inputs input {
  flex: 1;
}

.range-inputs span {
  color: var(--text-secondary);
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.block-content {
  animation: slideIn 0.2s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .block-content {
    grid-template-columns: 1fr;
  }

  .block-info {
    flex-direction: column;
    gap: 4px;
  }

  .quick-stat {
    font-size: 0.75em;
    padding: 2px 6px;
  }
}
</style>