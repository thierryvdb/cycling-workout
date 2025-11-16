<template>
  <div class="not-found-page">
    <h1>404 - Página Não Encontrada</h1>
    <p>Desculpe, a página que você está procurando não existe.</p>
    <router-link to="/" class="btn btn-primary">Voltar para o Início</router-link>
  </div>
</template>

<script setup>
// No script needed for this simple component
</script>

<style scoped>
.not-found-page {
  text-align: center;
  padding: 80px 20px;
}
.not-found-page h1 {
  font-size: 3em;
  margin-bottom: 20px;
}
.not-found-page p {
  font-size: 1.2em;
  margin-bottom: 30px;
  color: #7f8c8d;
}
.btn-primary {
  text-decoration: none;
  padding: 12px 25px;
  border-radius: 6px;
}
</style>