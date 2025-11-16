const axios = require('axios');
const stravaConfig = require('../config/strava');

class StravaService {
  constructor() {
    this.baseURL = stravaConfig.baseUrl;
  }

  async getAccessToken(authorizationCode) {
    try {
      const response = await axios.post(`${this.baseURL}/oauth/token`, {
        client_id: stravaConfig.clientId,
        client_secret: stravaConfig.clientSecret,
        code: authorizationCode,
        grant_type: 'authorization_code'
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: response.data.expires_at,
        athlete: response.data.athlete
      };
    } catch (error) {
      console.error('Erro ao obter access token:', error.response?.data || error.message);
      throw new Error('Falha na autenticação com Strava');
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(`${this.baseURL}/oauth/token`, {
        client_id: stravaConfig.clientId,
        client_secret: stravaConfig.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: response.data.expires_at
      };
    } catch (error) {
      console.error('Erro ao refresh token:', error.response?.data || error.message);
      throw new Error('Falha ao renovar token do Strava');
    }
  }

  async getAthlete(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/athlete`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados do atleta:', error.response?.data || error.message);
      throw new Error('Falha ao obter dados do atleta');
    }
  }

  async getActivities(accessToken, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.before) params.append('before', options.before);
      if (options.after) params.append('after', options.after);
      if (options.page) params.append('page', options.page);
      if (options.per_page) params.append('per_page', options.per_page);

      const response = await axios.get(`${this.baseURL}/athlete/activities?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao obter atividades:', error.response?.data || error.message);
      throw new Error('Falha ao obter atividades do Strava');
    }
  }

  async getActivity(accessToken, activityId) {
    try {
      const response = await axios.get(`${this.baseURL}/activities/${activityId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter atividade:', error.response?.data || error.message);
      throw new Error('Falha ao obter atividade do Strava');
    }
  }

  async getActivityStreams(accessToken, activityId, streamTypes = ['time', 'distance', 'latlng', 'altitude', 'velocity_smooth', 'heartrate', 'cadence', 'watts', 'temp', 'moving', 'grade_smooth']) {
    try {
      const types = streamTypes.join(',');
      const response = await axios.get(
        `${this.baseURL}/activities/${activityId}/streams?keys=${types}&key_by_type=true`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter streams da atividade:', error.response?.data || error.message);
      throw new Error('Falha ao obter dados detalhados da atividade');
    }
  }

  isTokenExpired(expiresAt) {
    return Date.now() >= expiresAt * 1000;
  }
}

module.exports = new StravaService();