const Activity = require('../models/Activity');
const User = require('../models/User');
const StravaService = require('../services/StravaService');

class ActivityController {
  static async getActivitiesForUser(req, res) {
    try {
      const userId = req.user.id; // Assumindo que o ID do usuário vem do middleware de autenticação
      const { limit, offset } = req.query;

      const activities = await Activity.findByUserId(userId, { limit, offset });

      res.json({
        success: true,
        data: activities
      });

    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar atividades',
        error: error.message
      });
    }
  }

  static async getActivityDetails(req, res) {
    try {
      const { activityId } = req.params;
      const activity = await Activity.findById(activityId);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Atividade não encontrada'
        });
      }

      // Verificação de permissão (opcional, mas recomendado)
      if (activity.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      res.json({
        success: true,
        data: activity
      });

    } catch (error) {
      console.error('Erro ao buscar detalhes da atividade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar detalhes da atividade',
        error: error.message
      });
    }
  }

  static async getActivityStreams(req, res) {
    try {
      const { activityId } = req.params;
      const activity = await Activity.findById(activityId);

      if (!activity) {
        return res.status(404).json({ success: false, message: 'Atividade não encontrada' });
      }

      // Garante que o usuário só possa ver seus próprios streams
      if (activity.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }

      const user = await User.findById(req.user.id);
      if (!user || !user.strava_access_token) {
        return res.status(400).json({ success: false, message: 'Usuário não conectado ao Strava ou token inválido.' });
      }

      // Renova o token se estiver expirado
      let accessToken = user.strava_access_token;
      if (StravaService.isTokenExpired(new Date(user.strava_token_expires_at).getTime() / 1000)) {
        const newTokens = await StravaService.refreshAccessToken(user.strava_refresh_token);
        await User.updateStravaData(user.id, {
          strava_access_token: newTokens.accessToken,
          strava_refresh_token: newTokens.refreshToken,
          strava_token_expires_at: new Date(newTokens.expiresAt * 1000)
        });
        accessToken = newTokens.accessToken;
      }

      const streams = await StravaService.getActivityStreams(accessToken, activity.strava_id);

      res.json({ success: true, data: streams });

    } catch (error) {
      console.error('Erro ao buscar streams da atividade:', error);
      res.status(500).json({
        success: false, message: 'Erro ao buscar streams da atividade', error: error.message
      });
    }
  }
}

module.exports = ActivityController;