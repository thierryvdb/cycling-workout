const db = require('../config/database');

async function createUsersTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      ftp INTEGER,
      vo2max REAL,
      max_heart_rate INTEGER,
      weight REAL,
      birth_date DATE,
      status VARCHAR(50) DEFAULT 'active',
      
      -- Colunas do Strava
      strava_id BIGINT UNIQUE,
      strava_access_token VARCHAR(255),
      strava_refresh_token VARCHAR(255),
      strava_token_expires_at TIMESTAMP WITH TIME ZONE,
      last_sync_at TIMESTAMP WITH TIME ZONE,
      auto_sync_enabled BOOLEAN DEFAULT true,

      -- Estatísticas do usuário
      total_activities INTEGER DEFAULT 0,
      total_distance REAL DEFAULT 0,
      total_time INTEGER DEFAULT 0,
      last_activity_date TIMESTAMP WITH TIME ZONE,

      -- Timestamps
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(query);
    console.log('✅ Tabela "users" criada ou já existente.');
  } catch (error) {
    console.error('❌ Erro ao criar tabela "users":', error);
    throw error;
  }
}

module.exports = createUsersTable;