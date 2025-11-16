<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>👤 Meu Perfil</h1>
      <p>Gerencie suas informações pessoais e conexões.</p>
    </div>

    <div class="profile-container">
      <!-- User Info Section -->
      <div class="profile-section user-info">
        <h2>Informações do Usuário</h2>
        <form @submit.prevent="saveProfile">
          <div class="info-grid">
            <div class="info-item">
              <label for="name">Nome</label>
              <input id="name" v-model="editableUser.name" :disabled="!isEditing" @blur="validateField('name')" />
              <span v-if="formErrors.name" class="error-message">{{ formErrors.name }}</span>
            </div>
            <div class="info-item">
              <label for="ftp">FTP (W)</label>
              <input id="ftp" type="number" v-model="editableUser.ftp" :disabled="!isEditing" @blur="validateField('ftp')" />
              <span v-if="formErrors.ftp" class="error-message">{{ formErrors.ftp }}</span>
            </div>
            <div class="info-item">
              <label for="max_hr">Frequência Cardíaca Máxima (bpm)</label>
              <input id="max_hr" type="number" v-model="editableUser.max_heart_rate" :disabled="!isEditing" @blur="validateField('max_heart_rate')" />
              <span v-if="formErrors.max_heart_rate" class="error-message">{{ formErrors.max_heart_rate }}</span>
            </div>
            <div class="info-item">
              <label for="weight">Peso (kg)</label>
              <input id="weight" type="number" step="0.1" v-model="editableUser.weight" :disabled="!isEditing" @blur="validateField('weight')" />
              <span v-if="formErrors.weight" class="error-message">{{ formErrors.weight }}</span>
            </div>
          </div>
          <div class="form-actions">
            <button v-if="!isEditing" @click.prevent="toggleEdit(true)" class="btn btn-secondary">
              ✏️ Editar Informações
            </button>
            <template v-else>
              <button type="button" @click="cancelEdit" class="btn btn-outline">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
                💾 Salvar Alterações
              </button>
            </template>
          </div>
        </form>
      </div>

      <!-- Strava Connection Section -->
      <div class="profile-section strava-info">
        <h2>Conexão com Strava</h2>
        <div v-if="stravaStore.isLoading" class="loading-indicator">
          <p>Conectando com o Strava...</p>
        </div>
        <div v-else-if="stravaStore.isConnected || user.strava_id" class="strava-connected">
          <div class="connected-status">
            <span class="icon">✅</span>
            <p>Conectado como <strong>{{ stravaStore.athlete?.firstname || user.name }}</strong></p>
          </div>
          <button @click="disconnectStrava" class="btn btn-danger">Desconectar</button>
        </div>
        <div v-else class="strava-disconnected">
          <p>Conecte sua conta do Strava para sincronizar suas atividades automaticamente.</p>
          <button @click="redirectToStrava" class="btn btn-strava">
            <img src="@/assets/images/strava-logo.svg" alt="Strava Logo" />
            Conectar com Strava
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useStravaStore } from '@/stores/stravaStore';

const workoutStore = useWorkoutStore();
const stravaStore = useStravaStore();

const user = computed(() => workoutStore.currentUser);
const isEditing = ref(false);
const editableUser = ref({});
const formErrors = ref({});
const isFormValid = computed(() => Object.keys(formErrors.value).length === 0);

const redirectToStrava = () => {
  const stravaAuthUrl = 'https://www.strava.com/oauth/authorize';
  const params = new URLSearchParams({
    client_id: 'YOUR_STRAVA_CLIENT_ID', // Substitua pelo seu Client ID do Strava
    response_type: 'code',
    redirect_uri: window.location.origin + '/auth/strava/callback',
    approval_prompt: 'force',
    scope: 'read,read_all,profile:read_all,activity:read_all',
  });
  window.location.href = `${stravaAuthUrl}?${params.toString()}`;
};

const disconnectStrava = () => {
  if (confirm('Tem certeza que deseja desconectar sua conta do Strava?')) {
    stravaStore.disconnectStrava();
    // Aqui você também deveria chamar uma ação no backend para limpar os tokens do usuário.
    window.showNotification('info', 'Strava Desconectado', 'Sua conta foi desconectada.');
  }
};

const toggleEdit = (editing) => {
  isEditing.value = editing;
  if (editing) {
    // Clona o usuário atual para um objeto editável para não alterar o estado global diretamente
    editableUser.value = { ...user.value };
  } else {
    formErrors.value = {};
  }
};

const cancelEdit = () => {
  toggleEdit(false);
  // Restaura os dados originais
  editableUser.value = { ...user.value };
};

const saveProfile = async () => {
  validateForm();
  if (!isFormValid.value) {
    window.showNotification('warning', 'Formulário Inválido', 'Por favor, corrija os erros antes de salvar.');
    return;
  }

  try {
    await workoutStore.updateCurrentUser(editableUser.value);
    toggleEdit(false);
    window.showNotification('success', 'Sucesso!', 'Seu perfil foi atualizado.');
  } catch (error) {
    window.showNotification('error', 'Erro', error.message || 'Não foi possível atualizar seu perfil.');
  }
};

const validateField = (field) => {
  const value = editableUser.value[field];
  delete formErrors.value[field]; // Limpa o erro anterior

  if (field === 'name' && (!value || value.length < 3)) {
    formErrors.value.name = 'O nome deve ter pelo menos 3 caracteres.';
  }
  if (field === 'ftp' && value && (value < 50 || value > 600)) {
    formErrors.value.ftp = 'FTP deve estar entre 50 e 600.';
  }
  if (field === 'max_heart_rate' && value && (value < 100 || value > 250)) {
    formErrors.value.max_heart_rate = 'FC Máx. deve estar entre 100 e 250.';
  }
  if (field === 'weight' && value && (value < 30 || value > 200)) {
    formErrors.value.weight = 'Peso deve estar entre 30 e 200.';
  }
};

const validateForm = () => {
  formErrors.value = {};
  validateField('name');
  validateField('ftp');
  validateField('max_heart_rate');
  validateField('weight');
};

// Garante que o formulário seja populado quando o usuário for carregado
watch(user, (newUser) => {
  if (newUser && !isEditing.value) {
    editableUser.value = { ...newUser };
  }
}, { immediate: true });
</script>

<style scoped>
.profile-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.profile-container {
  display: grid;
  gap: 30px;
}

.profile-section {
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.info-item label {
  display: block;
  font-size: 0.9em;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.error-message {
  color: #e74c3c;
  font-size: 0.8em;
  margin-top: 5px;
  height: 1em;
}

.info-item span, .info-item input {
  font-size: 1.1em;
  font-weight: 500;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  width: 100%;
  box-sizing: border-box;
}

.info-item input:not(:disabled) {
  border-color: #bdc3c7;
  background-color: #fff;
}

.info-item input:not(:disabled):focus {
  border-color: #3498db;
}

.info-item input:disabled {
  background-color: transparent;
}

.btn-strava {
  background-color: #FC4C02;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.btn-strava img {
  height: 20px;
}

.connected-status {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #e8f5e9;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
  border: none;
  cursor: pointer;
}

.btn-primary { background: #3498db; color: white; }
.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}
.btn-secondary { background: #95a5a6; color: white; }
.btn-danger { background: #e74c3c; color: white; }
.btn-outline { background: transparent; border: 1px solid #bdc3c7; color: #2c3e50;
}
</style>