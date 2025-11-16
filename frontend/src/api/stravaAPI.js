import axios from 'axios'

const API_URL = '/api/strava'

export const stravaAPI = {
  /**
   * Autentica com Strava usando código de autorização
   * @param {string} authorizationCode - Código de autorização do Strava OAuth
   * @returns {Promise} Response com dados do atleta
   */
  async authenticate(authorizationCode) {
    try {
      const response = await axios.post(`${API_URL}/auth`, {
        code: authorizationCode
      })
      return response.data
    } catch (error) {
      console.error('Erro ao autenticar com Strava:', error)
      throw error
    }
  },

  /**
   * Sincroniza atividades do Strava
   * @param {boolean} force - Forçar sincronização completa
   * @returns {Promise} Response com atividades sincronizadas
   */
  async syncActivities(force = false) {
    try {
      const response = await axios.post(`${API_URL}/sync`, { force })
      return response.data
    } catch (error) {
      console.error('Erro ao sincronizar atividades:', error)
      throw error
    }
  },

  /**
   * Busca atividades do Strava com filtros opcionais
   * @param {Object} filters - Filtros de busca (data, tipo, etc)
   * @returns {Promise} Response com lista de atividades
   */
  async getActivities(filters = {}) {
    try {
      const params = new URLSearchParams(filters)
      const response = await axios.get(`${API_URL}/activities?${params}`)
      return response
    } catch (error) {
      console.error('Erro ao buscar atividades:', error)
      throw error
    }
  },

  /**
   * Busca detalhes de uma atividade específica
   * @param {number|string} activityId - ID da atividade no Strava
   * @returns {Promise} Response com detalhes da atividade
   */
  async getActivityDetails(activityId) {
    try {
      const response = await axios.get(`${API_URL}/activities/${activityId}`)
      return response
    } catch (error) {
      console.error('Erro ao buscar detalhes da atividade:', error)
      throw error
    }
  },

  /**
   * Vincula uma atividade do Strava a um treino
   * @param {number|string} stravaActivityId - ID da atividade no Strava
   * @param {number|string} workoutId - ID do treino
   * @returns {Promise} Response com a atividade vinculada
   */
  async linkActivityToWorkout(stravaActivityId, workoutId) {
    try {
      const response = await axios.post(`${API_URL}/activities/${stravaActivityId}/link`, {
        workout_id: workoutId
      })
      return response
    } catch (error) {
      console.error('Erro ao vincular atividade ao treino:', error)
      throw error
    }
  },

  /**
   * Remove o vínculo entre atividade e treino
   * @param {number|string} stravaActivityId - ID da atividade no Strava
   * @returns {Promise} Response
   */
  async unlinkActivity(stravaActivityId) {
    try {
      const response = await axios.delete(`${API_URL}/activities/${stravaActivityId}/link`)
      return response
    } catch (error) {
      console.error('Erro ao desvincular atividade:', error)
      throw error
    }
  },

  /**
   * Obtém URL de autorização do Strava
   * @returns {Promise} Response com URL de autorização
   */
  async getAuthorizationUrl() {
    try {
      const response = await axios.get(`${API_URL}/auth/url`)
      return response.data
    } catch (error) {
      console.error('Erro ao obter URL de autorização:', error)
      throw error
    }
  },

  /**
   * Desconecta conta do Strava
   * @returns {Promise} Response
   */
  async disconnect() {
    try {
      const response = await axios.post(`${API_URL}/disconnect`)
      return response
    } catch (error) {
      console.error('Erro ao desconectar Strava:', error)
      throw error
    }
  },

  /**
   * Verifica status da conexão com Strava
   * @returns {Promise} Response com status da conexão
   */
  async getConnectionStatus() {
    try {
      const response = await axios.get(`${API_URL}/status`)
      return response.data
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error)
      throw error
    }
  }
}

export default stravaAPI
