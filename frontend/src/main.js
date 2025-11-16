import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './assets/css/global.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.config.errorHandler = (err, instance, info) => {
  console.error('Erro Vue:', err)
  console.error('Componente:', instance)
  console.error('Info:', info)
}

app.mount('#app')