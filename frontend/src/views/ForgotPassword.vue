<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Esqueceu sua Senha?</h2>
      <p class="subtitle">Sem problemas! Digite seu email e enviaremos um link para você criar uma nova senha.</p>

      <div v-if="message" class="success-message">
        <p>{{ message }}</p>
        <router-link to="/login" class="btn btn-secondary">Voltar para o Login</router-link>
      </div>

      <form v-else @submit.prevent="handleForgotPassword">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="seu.email@exemplo.com" />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Enviando...' : 'Enviar Link de Redefinição' }}
        </button>

        <div class="form-footer">
          <router-link to="/login">Lembrou a senha? Faça login</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const email = ref('');
const isLoading = ref(false);
const error = ref(null);
const message = ref(null);
const authStore = useAuthStore();

const handleForgotPassword = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await authStore.forgotPassword(email.value);
    message.value = response.message;
  } catch (err) {
    error.value = err.message || 'Ocorreu um erro. Tente novamente.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Estilos reutilizados da página de Login podem ser extraídos para um CSS comum */
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
.form-footer {
  text-align: center;
  margin-top: 20px;
}
</style>