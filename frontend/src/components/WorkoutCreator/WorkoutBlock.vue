<template>
  <div class="workout-block">
    <div class="block-header">
      <span class="block-index">#{{ index + 1 }}</span>
      <div class="block-actions">
        <button @click="$emit('duplicate', index)" title="Duplicar Bloco">📋</button>
        <button @click="$emit('remove', index)" title="Remover Bloco">❌</button>
      </div>
    </div>
    <div class="block-content">
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
        <label>Notas</label>
        <textarea v-model="editableBlock.notes" @change="onUpdate" placeholder="Ex: Aumentar cadência no final"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  block: Object,
  index: Number,
});

const emit = defineEmits(['update', 'remove', 'duplicate']);

const editableBlock = ref({ ...props.block });

watch(() => props.block, (newBlock) => {
  editableBlock.value = { ...newBlock };
}, { deep: true });

const onUpdate = () => {
  emit('update', props.index, editableBlock.value);
};
</script>

<style scoped>
.workout-block {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
}
.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}
.block-index { font-weight: bold; color: #3498db; }
.block-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1em;
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.block-actions button:hover { opacity: 1; }
.block-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}
.form-group label {
  display: block;
  font-size: 0.8em;
  margin-bottom: 5px;
  color: #7f8c8d;
}
.form-group input, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.range-inputs { display: flex; align-items: center; gap: 5px; }
</style>