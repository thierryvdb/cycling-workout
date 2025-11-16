const db = require('../../config/database');

async function createActivitiesTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      strava_id BIGINT NOT NULL,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50),
      sport_type VARCHAR(50),
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      distance REAL,
      moving_time INTEGER,
      elapsed_time INTEGER,
      total_elevation_gain REAL,
      average_speed REAL,
      max_speed REAL,
      average_cadence REAL,
      average_watts REAL,
      average_heartrate REAL,
      max_heartrate REAL,
      tss REAL,
      kilojoules REAL,
      map_polyline TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(user_id, strava_id)
    );
  `;

  try {
    await db.query(query);
    console.log('✅ Tabela "activities" criada ou já existente.');
  } catch (error) {
    console.error('❌ Erro ao criar tabela "activities":', error);
  }
}

module.exports = createActivitiesTable;