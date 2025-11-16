const db = require('../../config/database');

async function createWorkoutsTables() {
  const workoutsQuery = `
    CREATE TABLE IF NOT EXISTS workouts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      total_duration INTEGER, -- em minutos
      total_tss INTEGER,
      sport_type VARCHAR(50) DEFAULT 'cycling',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const blocksQuery = `
    CREATE TABLE IF NOT EXISTS workout_blocks (
      id SERIAL PRIMARY KEY,
      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      block_order INTEGER NOT NULL,
      duration INTEGER NOT NULL, -- em minutos
      zone_type VARCHAR(50),
      power_target REAL,
      power_min REAL,
      power_max REAL,
      cadence_target INTEGER,
      cadence_min INTEGER,
      cadence_max INTEGER,
      hr_min INTEGER,
      hr_max INTEGER,
      terrain_type VARCHAR(50),
      notes TEXT
    );
  `;

  const filesQuery = `
    CREATE TABLE IF NOT EXISTS workout_files (
      id SERIAL PRIMARY KEY,
      workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      file_type VARCHAR(10) NOT NULL, -- zwo, fit, erg
      file_path VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(workoutsQuery);
    console.log('✅ Tabela "workouts" criada ou já existente.');

    await db.query(blocksQuery);
    console.log('✅ Tabela "workout_blocks" criada ou já existente.');

    await db.query(filesQuery);
    console.log('✅ Tabela "workout_files" criada ou já existente.');

  } catch (error) {
    console.error('❌ Erro ao criar tabelas de treino:', error);
    throw error;
  }
}

module.exports = createWorkoutsTables;