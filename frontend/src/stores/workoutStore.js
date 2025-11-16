import { defineStore } from 'pinia'
import { workoutAPI } from '@/api/workoutAPI'

export const useWorkoutStore = defineStore('workout', {
  state: () => ({
    currentUser: {
      id: 1,
      name: 'Ciclista',
      ftp: 250,
      vo2max: 55,
      max_heart_rate: 185,
      weight: 70
    },
    workouts: [],
    currentWorkout: null,
    isLoading: false
  }),

  getters: {
    currentWorkoutId: (state) => state.currentWorkout?.id,
    workoutHistory: (state) => state.workouts
  },

  actions: {
    async saveWorkout(workoutData) {
      this.isLoading = true
      try {
        const response = await workoutAPI.createWorkout(workoutData)
        this.workouts.unshift(response.data)
        this.currentWorkout = response.data
        return response.data
      } catch (error) {
        throw new Error('Erro ao salvar treino: ' + error.message)
      } finally {
        this.isLoading = false
      }
    },

    async loadWorkouts() {
      this.isLoading = true
      try {
        const response = await workoutAPI.getWorkouts()
        this.workouts = response.data
      } catch (error) {
        throw new Error('Erro ao carregar treinos: ' + error.message)
      } finally {
        this.isLoading = false
      }
    },

    async exportWorkout(workoutId, format) {
      try {
        const response = await workoutAPI.exportWorkout(workoutId, format)
        
        const blob = new Blob([response.data], { type: response.headers['content-type'] })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        
        const filename = response.headers['content-disposition']
          ? response.headers['content-disposition'].split('filename=')[1]
          : `workout.${format}`
        
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
      } catch (error) {
        throw new Error('Erro ao exportar treino: ' + error.message)
      }
    },

    updateUserFTP(newFTP) {
      this.currentUser.ftp = newFTP
    }
  }
})