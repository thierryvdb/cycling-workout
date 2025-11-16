const JobSchedulerService = require('../services/JobSchedulerService');
const SyncJobService = require('../services/SyncJobService');
const User = require('../models/User');

class JobController {
  static async initializeScheduler(req, res) {
    try {
      JobSchedulerService.initialize();
      JobSchedulerService.startAllJobs();

      res.json({
        success: true,
        message: 'Job Scheduler inicializado e iniciado',
        jobs: JobSchedulerService.getJobStatus()
      });

    } catch (error) {
      console.error('Erro ao inicializar scheduler:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async executeJob(req, res) {
    try {
      const { jobName } = req.params;

      await JobSchedulerService.executeJobImmediately(jobName);

      res.json({
        success: true,
        message: `Job ${jobName} executado manualmente`
      });

    } catch (error) {
      console.error('Erro ao executar job:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getJobStatus(req, res) {
    try {
      const status = JobSchedulerService.getJobStatus();

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('Erro ao obter status dos jobs:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getJobHistory(req, res) {
    try {
      const { limit } = req.query;
      const jobs = await SyncJobService.getJobHistory(limit);

      res.json({
        success: true,
        data: jobs
      });

    } catch (error) {
      console.error('Erro ao obter histórico de jobs:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getJobDetails(req, res) {
    try {
      const { jobId } = req.params;
      const details = await SyncJobService.getJobDetails(jobId);

      res.json({
        success: true,
        data: details
      });

    } catch (error) {
      console.error('Erro ao obter detalhes do job:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getUserSyncStatus(req, res) {
    try {
      const { userId } = req.params;
      const status = await SyncJobService.getUserSyncStatus(userId);

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('Erro ao obter status do usuário:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateUserAutoSync(req, res) {
    try {
      const { userId } = req.params;
      const { enabled } = req.body;

      const user = await User.updateAutoSync(userId, enabled);

      res.json({
        success: true,
        message: `Auto-sync ${enabled ? 'ativado' : 'desativado'} para ${user.name}`,
        data: user
      });

    } catch (error) {
      console.error('Erro ao atualizar auto-sync:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async syncUserManually(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const result = await SyncJobService.syncUserActivities(user, 'manual_sync');

      res.json({
        success: true,
        message: `Sincronização manual concluída para ${user.name}`,
        data: result
      });

    } catch (error) {
      console.error('Erro na sincronização manual:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = JobController;