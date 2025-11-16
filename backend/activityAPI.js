import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/activities',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const activityAPI = {
  getActivities: () => apiClient.get('/'),
  getActivityDetails: (activityId) => apiClient.get(`/${activityId}`),
  getActivityStreams: (activityId) => apiClient.get(`/${activityId}/streams`),
};