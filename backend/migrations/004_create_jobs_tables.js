const db = require('../config/database');

async function createJobsTables() {
  const jobsQuery = `
    CREATE TABLE IF NOT EXISTS sync_jobs (
      id SERIAL PRIMARY KEY,
      job_type VARCHAR(50) NOT NULL, -- 'strava_sync', 'cleanup', etc.
      status VARCHAR(50) NOT NULL, -- 'running', 'completed', 'failed'
      started_at TIMESTAMP WITH TIME ZONE,
      completed_at TIMESTAMP WITH TIME ZONE,
      total_users INTEGER,
      processed_users INTEGER,
      successful_syncs INTEGER,
      failed_syncs INTEGER,
      error_message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const logsQuery = `
    CREATE TABLE IF NOT EXISTS sync_job_logs (
      id SERIAL PRIMARY KEY,
      sync_job_id INTEGER REFERENCES sync_jobs(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL, -- 'success', 'failed'
      activities_synced INTEGER,
      sync_duration INTEGER, -- em segundos
      error_message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(jobsQuery);
    console.log('✅ Tabela "sync_jobs" criada ou já existente.');

    await db.query(logsQuery);
    console.log('✅ Tabela "sync_job_logs" criada ou já existente.');

  } catch (error) {
    console.error('❌ Erro ao criar tabelas de jobs:', error);
    throw error;
  }
}

module.exports = createJobsTables;