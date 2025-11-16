import { defineStore } from 'pinia'
import { stravaAPI } from '@/api/stravaAPI'

export const useStravaStore = defineStore('strava', {
  state: () => ({
    isConnected: false,
    athlete: null,
    activities: [],
    isLoading: false,
    syncStatus: 'idle'
  }),

  getters: {
    connectedActivities: (state) => state.activities.filter(a => a.workout_id),
    unconnectedActivities: (state) => state.activities.filter(a => !a.workout_id),
    recentActivities: (state) => state.activities.slice(0, 10)
  },

  actions: {
    async connectStrava(authorizationCode) {
      this.isLoading = true
      try {
        const response = await stravaAPI.authenticate(authorizationCode)
        this.isConnected = true
        this.athlete = response.athlete
        
        await this.syncActivities()
        
        return response
      } catch (error) {
        throw new Error(`Falha na conexão com Strava: ${error.message}`)
      } finally {
        this.isLoading = false
      }
    },

    async syncActivities(force = false) {
      this.syncStatus = 'syncing'
      try {
        const response = await stravaAPI.syncActivities(force)
        this.activities = response.activities
        this.syncStatus = 'success'
        return response
      } catch (error) {
        this.syncStatus = 'error'
        throw new Error(`Falha na sincronização: ${error.message}`)
      }
    },

    async getActivities(filters = {}) {
      this.isLoading = true
      try {
        const response = await stravaAPI.getActivities(filters)
        this.activities = response.data
        return response
      } catch (error) {
        throw new Error(`Falha ao carregar atividades: ${error.message}`)
      } finally {
        this.isLoading = false
      }
    },

    async linkActivityToWorkout(stravaActivityId, workoutId) {
      try {
        const response = await stravaAPI.linkActivityToWorkout(stravaActivityId, workoutId)
        
        const activityIndex = this.activities.findIndex(a => a.strava_activity_id === stravaActivityId)
        if (activityIndex !== -1) {
          this.activities[activityIndex] = response.data
        }
        
        return response
      } catch (error) {
        throw new Error(`Falha ao vincular atividade: ${error.message}`)
      }
    },

    async getActivityDetails(activityId) {
      try {
        const response = await stravaAPI.getActivityDetails(activityId)
        return response
      } catch (error) {
        throw new Error(`Falha ao carregar detalhes: ${error.message}`)
      }
    },

    disconnectStrava() {
      this.isConnected = false
      this.athlete = null
      this.activities = []
    }
  }
})