import { defineStore } from 'pinia'
import apiClient from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    async login(email, password) {
      this.isLoading = true
      try {
        const response = await apiClient.post('/users/login', {
          email,
          password
        })

        const { token, user } = response.data

        this.token = token
        this.user = user
        this.isAuthenticated = true

        // Salva token no localStorage
        localStorage.setItem('token', token)

        return response.data
      } catch (error) {
        this.logout()
        throw new Error(error.response?.data?.message || 'Erro ao fazer login')
      } finally {
        this.isLoading = false
      }
    },

    async register(userData) {
      this.isLoading = true
      try {
        const response = await apiClient.post('/users/register', userData)

        const { token, user } = response.data

        this.token = token
        this.user = user
        this.isAuthenticated = true

        localStorage.setItem('token', token)

        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao registrar')
      } finally {
        this.isLoading = false
      }
    },

    async fetchUser() {
      if (!this.token) {
        return
      }

      try {
        const response = await apiClient.get('/users/me')
        this.user = response.data
      } catch (error) {
        console.error('Erro ao buscar usuário:', error)
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false

      localStorage.removeItem('token')
    },

    async updateProfile(userData) {
      try {
        const response = await apiClient.put('/users/profile', userData)
        this.user = response.data
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao atualizar perfil')
      }
    },

    async changePassword(currentPassword, newPassword) {
      try {
        const response = await apiClient.post('/users/change-password', {
          currentPassword,
          newPassword
        })
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao alterar senha')
      }
    },

    initializeAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        this.isAuthenticated = true
        this.fetchUser()
      }
    }
  }
})
