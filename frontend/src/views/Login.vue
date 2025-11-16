<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Login</h2>
      <p class="subtitle">Bem-vindo de volta! Faça login para continuar.</p>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>
        <div class="form-footer">
          <router-link to="/forgot-password">Esqueceu a senha?</router-link>
          <p>Não tem uma conta? <router-link to="/register">Cadastre-se</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref(null);
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await authStore.login(email.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.message || 'Email ou senha inválidos.';
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
.error-message {
  color: #e74c3c;
  margin-bottom: 15px;
  text-align: center;
}
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; }
.form-group input { width: 100%; padding: 10px; }
.btn-primary { width: 100%; padding: 12px; }
.form-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9em;
}
</style>