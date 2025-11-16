import apiClient from './axios'

const API_URL = '/workouts'

export const workoutAPI = {
  /**
   * Cria um novo treino
   * @param {Object} workoutData - Dados do treino
   * @returns {Promise} Response com o treino criado
   */
  async createWorkout(workoutData) {
    try {
      const response = await apiClient.post(API_URL, workoutData)
      return response
    } catch (error) {
      console.error('Erro ao criar treino:', error)
      throw error
    }
  },

  /**
   * Busca todos os treinos
   * @returns {Promise} Response com lista de treinos
   */
  async getWorkouts() {
    try {
      const response = await apiClient.get(API_URL)
      return response
    } catch (error) {
      console.error('Erro ao buscar treinos:', error)
      throw error
    }
  },

  /**
   * Busca um treino específico por ID
   * @param {number|string} workoutId - ID do treino
   * @returns {Promise} Response com o treino
   */
  async getWorkoutById(workoutId) {
    try {
      const response = await apiClient.get(`${API_URL}/${workoutId}`)
      return response
    } catch (error) {
      console.error('Erro ao buscar treino:', error)
      throw error
    }
  },

  /**
   * Atualiza um treino existente
   * @param {number|string} workoutId - ID do treino
   * @param {Object} workoutData - Dados atualizados do treino
   * @returns {Promise} Response com o treino atualizado
   */
  async updateWorkout(workoutId, workoutData) {
    try {
      const response = await apiClient.put(`${API_URL}/${workoutId}`, workoutData)
      return response
    } catch (error) {
      console.error('Erro ao atualizar treino:', error)
      throw error
    }
  },

  /**
   * Deleta um treino
   * @param {number|string} workoutId - ID do treino
   * @returns {Promise} Response
   */
  async deleteWorkout(workoutId) {
    try {
      const response = await apiClient.delete(`${API_URL}/${workoutId}`)
      return response
    } catch (error) {
      console.error('Erro ao deletar treino:', error)
      throw error
    }
  },

  /**
   * Exporta um treino em formato específico (ZWO, FIT, etc)
   * @param {number|string} workoutId - ID do treino
   * @param {string} format - Formato de exportação ('zwo', 'fit', 'mrc', etc)
   * @returns {Promise} Response com o arquivo para download
   */
  async exportWorkout(workoutId, format) {
    try {
      const response = await apiClient.get(`${API_URL}/${workoutId}/export/${format}`, {
        responseType: 'blob'
      })
      return response
    } catch (error) {
      console.error('Erro ao exportar treino:', error)
      throw error
    }
  },

  /**
   * Duplica um treino existente
   * @param {number|string} workoutId - ID do treino a ser duplicado
   * @returns {Promise} Response com o novo treino
   */
  async duplicateWorkout(workoutId) {
    try {
      const response = await apiClient.post(`${API_URL}/${workoutId}/duplicate`)
      return response
    } catch (error) {
      console.error('Erro ao duplicar treino:', error)
      throw error
    }
  }
}

export default workoutAPI
