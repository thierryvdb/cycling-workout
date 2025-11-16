import { defineStore } from 'pinia';
import { activityAPI } from '@/api/activityAPI';

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: [],
    currentActivity: null,
    activityStreams: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    recentActivities: (state) => state.activities.slice(0, 5),
  },

  actions: {
    async fetchActivities() {
      if (this.activities.length > 0) return;

      this.isLoading = true;
      this.error = null;
      try {
        const response = await activityAPI.getActivities();
        this.activities = response.data.data;
      } catch (err) {
        this.error = 'Falha ao carregar atividades.';
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchActivityDetails(activityId) {
      this.isLoading = true;
      this.error = null;
      this.currentActivity = null;
      this.activityStreams = null;

      try {
        // Busca os detalhes e os streams em paralelo
        const [detailsResponse, streamsResponse] = await Promise.all([
          activityAPI.getActivityDetails(activityId),
          activityAPI.getActivityStreams(activityId)
        ]);
        
        this.currentActivity = detailsResponse.data.data;
        this.activityStreams = streamsResponse.data.data;
      } catch (err) {
        this.error = 'Falha ao carregar os detalhes da atividade.';
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    }
  },
});