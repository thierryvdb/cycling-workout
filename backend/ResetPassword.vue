<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Redefinir Senha</h2>

      <div v-if="message" class="success-message">
        <p>{{ message }}</p>
        <router-link to="/login" class="btn btn-primary">Ir para o Login</router-link>
      </div>

      <form v-else @submit.prevent="handleResetPassword">
        <p class="subtitle">Crie uma nova senha para sua conta.</p>

        <div class="form-group">
          <label for="password">Nova Senha</label>
          <input type="password" id="password" v-model="password" required />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar Nova Senha</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Salvando...' : 'Salvar Nova Senha' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const authStore = useAuthStore();

const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const error = ref(null);
const message = ref(null);

const handleResetPassword = async () => {
  error.value = null;
  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem.';
    return;
  }
  if (password.value.length < 6) {
    error.value = 'A senha deve ter pelo menos 6 caracteres.';
    return;
  }

  isLoading.value = true;
  try {
    const token = route.params.token;
    const response = await authStore.resetPassword(token, password.value);
    message.value = response.message;
  } catch (err) {
    error.value = err.message || 'Ocorreu um erro. O link pode ter expirado.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background: var(--surface-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}
.subtitle {
  margin-bottom: 20px;
  color: var(--text-secondary);
}
.success-message {
  text-align: center;
  padding: 20px;
  background-color: #e8f5e9;
  border-radius: 6px;
  color: #2e7d32;
}
.error-message {
  color: #e74c3c;
  background-color: #fbe9e7;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
}
.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}
</style>