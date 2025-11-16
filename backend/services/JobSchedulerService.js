const cron = require('node-cron');
const SyncJobService = require('./SyncJobService');
const db = require('../config/database');

class JobSchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;

    console.log('🚀 Inicializando Job Scheduler...');

    // Job diário de sincronização do Strava - 6h da manhã
    this.scheduleJob('strava_daily_sync', '0 6 * * *', async () => {
      console.log('🔄 Executando job diário de sincronização Strava...');
      await SyncJobService.executeStravaSyncJob();
    });

    // Job de limpeza semanal - Domingo à meia-noite
    this.scheduleJob('weekly_cleanup', '0 0 * * 0', async () => {
      console.log('🧹 Executando job de limpeza semanal...');
      await SyncJobService.executeCleanupJob();
    });

    // Job de notificações - 8h da manhã
    this.scheduleJob('daily_notifications', '0 8 * * *', async () => {
      console.log('🔔 Executando job de notificações...');
      await SyncJobService.executeNotificationJob();
    });

    this.isInitialized = true;
    console.log('✅ Job Scheduler inicializado com sucesso');
  }

  scheduleJob(name, cronExpression, task) {
    const job = cron.schedule(cronExpression, task, {
      scheduled: false,
      timezone: "America/Sao_Paulo"
    });

    this.jobs.set(name, job);
    console.log(`⏰ Job agendado: ${name} - ${cronExpression}`);
  }

  startJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.start();
      console.log(`▶️ Job iniciado: ${name}`);
    }
  }

  stopJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      console.log(`⏹️ Job parado: ${name}`);
    }
  }

  startAllJobs() {
    for (const [name, job] of this.jobs) {
      job.start();
    }
    console.log('▶️ Todos os jobs iniciados');
  }

  stopAllJobs() {
    for (const [name, job] of this.jobs) {
      job.stop();
    }
    console.log('⏹️ Todos os jobs parados');
  }

  async executeJobImmediately(name) {
    const job = this.jobs.get(name);
    if (job) {
      console.log(`⚡ Executando job imediatamente: ${name}`);
      await job.getTask()();
    }
  }

  getJobStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        scheduled: job.getStatus() === 'scheduled',
        nextDates: job.getNextDates(3)
      };
    }
    return status;
  }
}

module.exports = new JobSchedulerService();