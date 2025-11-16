const StravaService = require('../services/StravaService');
const Activity = require('../models/Activity');
const User = require('../models/User');

class StravaController {
  static async authenticate(req, res) {
    try {
      const { code } = req.body;
      const userId = req.user.id;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Código de autorização não fornecido'
        });
      }

      const tokenData = await StravaService.getAccessToken(code);
      
      await User.updateStravaData(userId, {
        strava_id: tokenData.athlete.id,
        strava_access_token: tokenData.accessToken,
        strava_refresh_token: tokenData.refreshToken,
        strava_token_expires_at: new Date(tokenData.expiresAt * 1000)
      });

      await StravaController.syncUserActivities(userId);

      res.json({
        success: true,
        message: 'Conta Strava conectada com sucesso',
        athlete: tokenData.athlete
      });

    } catch (error) {
      console.error('Erro na autenticação Strava:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async syncActivities(req, res) {
    try {
      const userId = req.user.id;
      const { force } = req.body;

      const activities = await StravaController.syncUserActivities(userId, force);

      res.json({
        success: true,
        message: `Sincronizadas ${activities.length} atividades`,
        activities
      });

    } catch (error) {
      console.error('Erro na sincronização:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async syncUserActivities(userId, force = false) {
    const user = await User.findById(userId);
    
    if (!user.strava_access_token) {
      throw new Error('Usuário não possui conexão com Strava');
    }

    if (StravaService.isTokenExpired(user.strava_token_expires_at)) {
      const newTokens = await StravaService.refreshAccessToken(user.strava_refresh_token);
      
      await User.updateStravaData(userId, {
        strava_access_token: newTokens.accessToken,
        strava_refresh_token: newTokens.refreshToken,
        strava_token_expires_at: new Date(newTokens.expiresAt * 1000)
      });

      user.strava_access_token = newTokens.accessToken;
    }

    const stravaActivities = await StravaService.getActivities(user.strava_access_token, {
      after: force ? undefined : this.getLastSyncDate(userId),
      per_page: 50
    });

    const savedActivities = [];

    for (const stravaActivity of stravaActivities) {
      const existingActivity = await Activity.findByStravaId(stravaActivity.id);
      
      if (!existingActivity || force) {
        const activityData = {
          user_id: userId,
          strava_activity_id: stravaActivity.id,
          name: stravaActivity.name,
          type: stravaActivity.type,
          distance: stravaActivity.distance,
          moving_time: stravaActivity.moving_time,
          elapsed_time: stravaActivity.elapsed_time,
          total_elevation_gain: stravaActivity.total_elevation_gain,
          start_date: stravaActivity.start_date,
          start_date_local: stravaActivity.start_date_local,
          timezone: stravaActivity.timezone,
          average_speed: stravaActivity.average_speed,
          max_speed: stravaActivity.max_speed,
          average_cadence: stravaActivity.average_cadence,
          average_temp: stravaActivity.average_temp,
          average_watts: stravaActivity.average_watts,
          max_watts: stravaActivity.max_watts,
          weighted_average_watts: stravaActivity.weighted_average_watts,
          kilojoules: stravaActivity.kilojoules,
          device_watts: stravaActivity.device_watts,
          average_heartrate: stravaActivity.average_heartrate,
          max_heartrate: stravaActivity.max_heartrate,
          elev_high: stravaActivity.elev_high,
          elev_low: stravaActivity.elev_low,
          suffer_score: stravaActivity.suffer_score,
          calories: stravaActivity.calories,
          description: stravaActivity.description,
          perceived_exertion: stravaActivity.perceived_exertion,
          prefer_perceived_exertion: stravaActivity.prefer_perceived_exertion
        };

        const matchedWorkoutId = await StravaController.autoMatchWorkout(userId, activityData);
        if (matchedWorkoutId) {
          activityData.workout_id = matchedWorkoutId;
          activityData.sync_status = 'matched';
        }

        const savedActivity = await Activity.create(activityData);
        savedActivities.push(savedActivity);
      }
    }

    return savedActivities;
  }

  static async autoMatchWorkout(userId, activityData) {
    const workouts = await User.getWorkoutsByDateRange(
      userId, 
      new Date(activityData.start_date),
      new Date(activityData.start_date)
    );

    let bestMatch = null;
    let bestScore = 0;

    for (const workout of workouts) {
      const score = this.calculateWorkoutMatchScore(workout, activityData);
      
      if (score > bestScore && score > 0.6) {
        bestScore = score;
        bestMatch = workout.id;
      }
    }

    return bestMatch;
  }

  static calculateWorkoutMatchScore(workout, activityData) {
    let score = 0;
    const maxScore = 100;

    const durationDiff = Math.abs(workout.total_duration - (activityData.moving_time / 60));
    const durationScore = Math.max(0, 30 - (durationDiff / 5));
    score += durationScore;

    if (workout.sport_type === activityData.type.toLowerCase()) {
      score += 20;
    }

    if (workout.total_tss && activityData.suffer_score) {
      const tssDiff = Math.abs(workout.total_tss - activityData.suffer_score);
      const tssScore = Math.max(0, 30 - (tssDiff / 3));
      score += tssScore;
    }

    const workoutName = workout.name.toLowerCase();
    const activityName = activityData.name.toLowerCase();
    
    if (activityName.includes(workoutName) || workoutName.includes(activityName)) {
      score += 20;
    }

    return score / maxScore;
  }

  static async getUserActivities(req, res) {
    try {
      const userId = req.user.id;
      const { workout_id, start_date, end_date, limit } = req.query;

      const activities = await Activity.findByUserId(userId, {
        workout_id,
        start_date,
        end_date,
        limit: limit ? parseInt(limit) : 50
      });

      res.json({
        success: true,
        data: activities
      });

    } catch (error) {
      console.error('Erro ao obter atividades:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async linkActivityToWorkout(req, res) {
    try {
      const { strava_activity_id, workout_id } = req.body;
      const userId = req.user.id;

      const activity = await Activity.findByStravaId(strava_activity_id);
      
      if (!activity || activity.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Atividade não encontrada'
        });
      }

      const updatedActivity = await Activity.updateWorkoutMatch(
        strava_activity_id, 
        workout_id, 
        1.0,
        true
      );

      res.json({
        success: true,
        message: 'Atividade vinculada ao treino com sucesso',
        data: updatedActivity
      });

    } catch (error) {
      console.error('Erro ao vincular atividade:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getActivityDetails(req, res) {
    try {
      const { activityId } = req.params;
      const userId = req.user.id;

      const activity = await Activity.findById(activityId);
      
      if (!activity || activity[0].user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Atividade não encontrada'
        });
      }

      let streams = null;
      if (activity[0].strava_access_token) {
        try {
          streams = await StravaService.getActivityStreams(
            activity[0].strava_access_token,
            activity[0].strava_activity_id,
            ['time', 'watts', 'heartrate', 'cadence', 'velocity_smooth']
          );
        } catch (streamError) {
          console.warn('Não foi possível obter streams:', streamError.message);
        }
      }

      res.json({
        success: true,
        data: {
          activity: activity[0],
          planned_workout: activity[0].workout_id ? {
            blocks: activity.filter(a => a.block_order !== null).map(a => ({
              duration: a.duration,
              zone_type: a.zone_type,
              power_target: a.power_target,
              cadence_target: a.cadence_target
            }))
          } : null,
          streams
        }
      });

    } catch (error) {
      console.error('Erro ao obter detalhes da atividade:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static getLastSyncDate(userId) {
    return Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
  }
}

module.exports = StravaController;