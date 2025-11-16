import axios from 'axios'

// Configuração base do axios
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - adiciona token em todas as requisições
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - trata erros globalmente
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Erro 401 - não autorizado
      if (error.response.status === 401) {
        // Remove token inválido
        localStorage.removeItem('token')

        // Redireciona para login se não estiver na página de login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }

      // Erro 403 - acesso negado
      if (error.response.status === 403) {
        console.error('Acesso negado:', error.response.data.message)
      }

      // Erro 500 - erro do servidor
      if (error.response.status === 500) {
        console.error('Erro do servidor:', error.response.data.message)
      }
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      console.error('Erro de rede: Sem resposta do servidor')
    } else {
      // Algo aconteceu ao configurar a requisição
      console.error('Erro:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient
