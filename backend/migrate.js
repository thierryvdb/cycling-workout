const createUsersTable = require('./migrations/001_create_users_table.js');
const createWorkoutsTables = require('./migrations/002_create_workouts_tables.js');
const createActivitiesTable = require('./migrations/003_create_activities_table.js');
const createJobsTables = require('./migrations/004_create_jobs_tables.js');

async function runMigrations() {
  console.log('🚀 Iniciando migrações do banco de dados...');

  try {
    await createUsersTable();
    await createWorkoutsTables();
    await createActivitiesTable();
    await createJobsTables();

    console.log('✅ Todas as migrações foram concluídas com sucesso!');
  } catch (error) {
    console.error('❌ Falha durante a execução das migrações:', error);
  } finally {
    process.exit();
  }
}

runMigrations();