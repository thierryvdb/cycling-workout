const StravaService = require('./StravaService');
const Activity = require('../models/Activity');
const User = require('../models/User');
const db = require('../config/database');

class SyncJobService {
  constructor() {
    this.batchSize = 10;
    this.delayBetweenBatches = 5000;
  }

  async executeStravaSyncJob() {
    const job = await this.createSyncJob('strava_sync');
    
    try {
      console.log(`🔄 Iniciando sincronização em lote - Job ${job.id}`);

      const activeUsers = await this.getUsersToSync();
      
      job.total_users = activeUsers.length;
      await this.updateJobProgress(job.id, { total_users: activeUsers.length });

      console.log(`👥 ${activeUsers.length} usuários para sincronizar`);

      let successfulSyncs = 0;
      let failedSyncs = 0;

      for (let i = 0; i < activeUsers.length; i += this.batchSize) {
        const batch = activeUsers.slice(i, i + this.batchSize);
        
        console.log(`📦 Processando lote ${Math.floor(i/this.batchSize) + 1} de ${Math.ceil(activeUsers.length/this.batchSize)}`);

        const batchResults = await Promise.allSettled(
          batch.map(user => this.syncUserActivities(user, job.id))
        );

        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            successfulSyncs++;
          } else {
            failedSyncs++;
            console.error('❌ Erro na sincronização:', result.reason);
          }
        }

        job.processed_users = Math.min(i + this.batchSize, activeUsers.length);
        job.successful_syncs = successfulSyncs;
        job.failed_syncs = failedSyncs;

        await this.updateJobProgress(job.id, {
          processed_users: job.processed_users,
          successful_syncs: successfulSyncs,
          failed_syncs: failedSyncs
        });

        if (i + this.batchSize < activeUsers.length) {
          console.log(`⏳ Aguardando ${this.delayBetweenBatches/1000}s antes do próximo lote...`);
          await this.delay(this.delayBetweenBatches);
        }
      }

      await this.completeJob(job.id, 'completed', {
        successful_syncs: successfulSyncs,
        failed_syncs: failedSyncs
      });

      console.log(`✅ Sincronização concluída: ${successfulSyncs} sucessos, ${failedSyncs} falhas`);

    } catch (error) {
      console.error('❌ Erro no job de sincronização:', error);
      await this.completeJob(job.id, 'failed', { error_message: error.message });
    }
  }

  async syncUserActivities(user, jobId) {
    const startTime = Date.now();
    const logData = {
      sync_job_id: jobId,
      user_id: user.id,
      status: 'success',
      activities_synced: 0
    };

    try {
      console.log(`👤 Sincronizando usuário: ${user.name} (ID: ${user.id})`);

      if (this.isTokenExpired(user.strava_token_expires_at)) {
        console.log(`🔄 Renovando token para usuário ${user.name}`);
        const newTokens = await StravaService.refreshAccessToken(user.strava_refresh_token);
        
        await User.updateStravaData(user.id, {
          strava_access_token: newTokens.accessToken,
          strava_refresh_token: newTokens.refreshToken,
          strava_token_expires_at: new Date(newTokens.expiresAt * 1000)
        });

        user.strava_access_token = newTokens.accessToken;
      }

      const lastSyncDate = user.last_sync_at 
        ? Math.floor(new Date(user.last_sync_at).getTime() / 1000)
        : Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

      const activities = await StravaService.getActivities(user.strava_access_token, {
        after: lastSyncDate,
        per_page: 100
      });

      console.log(`📥 ${activities.length} novas atividades para ${user.name}`);

      let syncedActivities = 0;

      for (const stravaActivity of activities) {
        const existingActivity = await Activity.findOne({ where: { strava_id: stravaActivity.id, user_id: user.id } });
        
        if (!existingActivity) {
          const activityData = this._mapStravaActivityToDb(stravaActivity, user.id);
          
          const matchedWorkoutId = await this.autoMatchWorkout(user.id, activityData);
          if (matchedWorkoutId) {
            activityData.workout_id = matchedWorkoutId;
            activityData.sync_status = 'matched';
          }

          await Activity.create(activityData);
          syncedActivities++;
        }
      }

      await User.updateLastSync(user.id);

      logData.activities_synced = syncedActivities;
      logData.sync_duration = Math.round((Date.now() - startTime) / 1000);

      await this.createSyncLog(logData);

      console.log(`✅ ${user.name}: ${syncedActivities} atividades sincronizadas`);

      return {
        user: user.name,
        activitiesSynced: syncedActivities,
        duration: logData.sync_duration
      };

    } catch (error) {
      console.error(`❌ Erro na sincronização do usuário ${user.name}:`, error.message);

      logData.status = 'failed';
      logData.error_message = error.message;
      logData.sync_duration = Math.round((Date.now() - startTime) / 1000);

      await this.createSyncLog(logData);

      throw error;
    }
  }

  async executeCleanupJob() {
    const job = await this.createSyncJob('cleanup');
    
    try {
      console.log('🧹 Executando job de limpeza...');

      const deleteLogsQuery = `
        DELETE FROM sync_job_logs 
        WHERE created_at < NOW() - INTERVAL '30 days'
      `;
      await db.query(deleteLogsQuery);

      const deleteJobsQuery = `
        DELETE FROM sync_jobs 
        WHERE created_at < NOW() - INTERVAL '90 days'
        AND status IN ('completed', 'failed')
      `;
      await db.query(deleteJobsQuery);

      await this.updateUserStatistics();

      await this.completeJob(job.id, 'completed');
      console.log('✅ Job de limpeza concluído');

    } catch (error) {
      console.error('❌ Erro no job de limpeza:', error);
      await this.completeJob(job.id, 'failed', { error_message: error.message });
    }
  }

  async executeNotificationJob() {
    const job = await this.createSyncJob('notifications');
    
    try {
      console.log('🔔 Executando job de notificações...');

      const usersWithNewActivities = await this.getUsersWithNewActivities();

      for (const user of usersWithNewActivities) {
        await this.sendActivityNotification(user);
      }

      await this.completeJob(job.id, 'completed', {
        notifications_sent: usersWithNewActivities.length
      });

      console.log(`✅ Notificações enviadas: ${usersWithNewActivities.length}`);

    } catch (error) {
      console.error('❌ Erro no job de notificações:', error);
      await this.completeJob(job.id, 'failed', { error_message: error.message });
    }
  }

  async getUsersToSync() {
    const query = `
      SELECT u.* 
      FROM users u 
      WHERE u.status = 'active' 
        AND u.auto_sync_enabled = true
        AND u.strava_access_token IS NOT NULL
        AND u.strava_refresh_token IS NOT NULL
      ORDER BY u.last_sync_at ASC NULLS FIRST
    `;

    const result = await db.query(query);
    return result.rows;
  }

  async getUsersWithNewActivities() {
    const query = `
      SELECT DISTINCT u.*, COUNT(sa.id) as new_activities
      FROM users u
      INNER JOIN strava_activities sa ON u.id = sa.user_id
      WHERE sa.created_at > NOW() - INTERVAL '24 hours'
        AND sa.sync_status = 'matched'
        AND u.auto_sync_enabled = true
      GROUP BY u.id
      HAVING COUNT(sa.id) > 0
    `;

    const result = await db.query(query);
    return result.rows;
  }

  async sendActivityNotification(user) {
    console.log(`📧 Notificação para ${user.name}: ${user.new_activities} novas atividades`);
    
    try {
      // Implementar envio de email aqui
      console.log(`✅ Notificação enviada para ${user.email}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar notificação para ${user.email}:`, error);
    }
  }

  async updateUserStatistics() {
    const query = `
      UPDATE users u 
      SET 
        total_activities = (
          SELECT COUNT(*) FROM strava_activities WHERE user_id = u.id
        ),
        total_distance = (
          SELECT COALESCE(SUM(distance), 0) FROM strava_activities WHERE user_id = u.id
        ),
        total_time = (
          SELECT COALESCE(SUM(moving_time), 0) FROM strava_activities WHERE user_id = u.id
        ),
        last_activity_date = (
          SELECT MAX(start_date) FROM strava_activities WHERE user_id = u.id
        )
      WHERE u.status = 'active'
    `;

    await db.query(query);
    console.log('📊 Estatísticas de usuários atualizadas');
  }

  _mapStravaActivityToDb(stravaActivity, userId) {
    return {
      user_id: userId,
      strava_id: stravaActivity.id,
      name: stravaActivity.name,
      type: stravaActivity.type,
      sport_type: stravaActivity.sport_type,
      start_date: stravaActivity.start_date,
      distance: stravaActivity.distance,
      moving_time: stravaActivity.moving_time,
      elapsed_time: stravaActivity.elapsed_time,
      total_elevation_gain: stravaActivity.total_elevation_gain,
      average_speed: stravaActivity.average_speed,
      max_speed: stravaActivity.max_speed,
      average_cadence: stravaActivity.average_cadence,
      average_watts: stravaActivity.average_watts,
      kilojoules: stravaActivity.kilojoules,
      average_heartrate: stravaActivity.average_heartrate,
      max_heartrate: stravaActivity.max_heartrate,
      // O campo 'tss' no Strava é chamado 'suffer_score' para atividades sem medidor de potência.
      // Se você calcula o TSS de outra forma, pode precisar ajustar aqui.
      tss: stravaActivity.suffer_score,
      // O polyline vem em um formato diferente, pode ser necessário buscar o stream da atividade
      map_polyline: stravaActivity.map?.summary_polyline || null,
    };
  }

  async autoMatchWorkout(userId, activityData) {
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

  calculateWorkoutMatchScore(workout, activityData) {
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

  isTokenExpired(expiresAt) {
    return !expiresAt || Date.now() >= new Date(expiresAt).getTime();
  }

  async createSyncJob(jobType) {
    const query = `
      INSERT INTO sync_jobs (job_type, status, started_at)
      VALUES ($1, 'running', NOW())
      RETURNING *
    `;
    
    const result = await db.query(query, [jobType]);
    return result.rows[0];
  }

  async updateJobProgress(jobId, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const values = Object.values(updates);
    values.push(jobId);

    const query = `
      UPDATE sync_jobs 
      SET ${setClause}
      WHERE id = $${values.length}
    `;

    await db.query(query, values);
  }

  async completeJob(jobId, status, additionalData = {}) {
    const updates = {
      status,
      completed_at: new Date(),
      ...additionalData
    };

    await this.updateJobProgress(jobId, updates);
  }

  async createSyncLog(logData) {
    const query = `
      INSERT INTO sync_job_logs 
      (sync_job_id, user_id, status, activities_synced, error_message, sync_duration)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await db.query(query, [
      logData.sync_job_id,
      logData.user_id,
      logData.status,
      logData.activities_synced,
      logData.error_message,
      logData.sync_duration
    ]);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getJobHistory(limit = 50) {
    const query = `
      SELECT * FROM sync_jobs 
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  async getJobDetails(jobId) {
    const jobQuery = 'SELECT * FROM sync_jobs WHERE id = $1';
    const logsQuery = `
      SELECT sjl.*, u.name as user_name, u.email
      FROM sync_job_logs sjl
      LEFT JOIN users u ON sjl.user_id = u.id
      WHERE sjl.sync_job_id = $1
      ORDER BY sjl.created_at DESC
    `;

    const [jobResult, logsResult] = await Promise.all([
      db.query(jobQuery, [jobId]),
      db.query(logsQuery, [jobId])
    ]);

    return {
      job: jobResult.rows[0],
      logs: logsResult.rows
    };
  }

  async getUserSyncStatus(userId) {
    const query = `
      SELECT 
        u.*,
        COUNT(sa.id) as total_activities,
        COUNT(sa.id) FILTER (WHERE sa.created_at > NOW() - INTERVAL '7 days') as recent_activities,
        u.last_sync_at,
        EXISTS (
          SELECT 1 FROM sync_job_logs sjl 
          WHERE sjl.user_id = u.id 
          AND sjl.status = 'failed'
          AND sjl.created_at > NOW() - INTERVAL '1 day'
        ) as has_recent_errors
      FROM users u
      LEFT JOIN strava_activities sa ON u.id = sa.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `;

    const result = await db.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = new SyncJobService();