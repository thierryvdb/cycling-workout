<template>
  <div class="callback-page">
    <div class="status-box">
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        <h2>Finalizando conexão com o Strava...</h2>
        <p>Por favor, aguarde um momento.</p>
      </div>
      <div v-if="error" class="error-message">
        <h2>❌ Erro na Conexão</h2>
        <p>{{ error }}</p>
        <router-link to="/profile" class="btn btn-primary">Voltar para o Perfil</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStravaStore } from '@/stores/stravaStore';

const route = useRoute();
const router = useRouter();
const stravaStore = useStravaStore();

const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  const { code, error: stravaError } = route.query;

  if (stravaError) {
    error.value = 'A autorização no Strava foi negada ou cancelada.';
    isLoading.value = false;
    return;
  }

  if (code) {
    try {
      await stravaStore.connectStrava(code);
      router.push('/profile');
    } catch (e) {
      error.value = e.message || 'Ocorreu uma falha desconhecida.';
      isLoading.value = false;
    }
  } else {
    error.value = 'Código de autorização do Strava não encontrado.';
    isLoading.value = false;
  }
});
</script>

<style scoped>
.callback-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
}
.status-box {
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
}
</style>