const db = require('../config/database');

class Workout {
  static async create(workoutData, blocks) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Insere o workout
      const workoutQuery = `
        INSERT INTO workouts (user_id, name, description, total_duration, total_tss, sport_type)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const workoutValues = [
        workoutData.user_id,
        workoutData.name,
        workoutData.description,
        workoutData.total_duration,
        workoutData.total_tss,
        workoutData.sport_type
      ];
      
      const workoutResult = await client.query(workoutQuery, workoutValues);
      const workout = workoutResult.rows[0];

      // Insere os blocos
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const blockQuery = `
          INSERT INTO workout_blocks 
          (workout_id, block_order, duration, zone_type, power_target, power_min, power_max, 
           cadence_target, cadence_min, cadence_max, hr_min, hr_max, terrain_type, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `;
        
        const blockValues = [
          workout.id,
          i,
          block.duration,
          block.zone_type,
          block.power_target,
          block.power_min,
          block.power_max,
          block.cadence_target,
          block.cadence_min,
          block.cadence_max,
          block.hr_min,
          block.hr_max,
          block.terrain_type,
          block.notes
        ];
        
        await client.query(blockQuery, blockValues);
      }

      await client.query('COMMIT');
      return workout;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByUserId(userId) {
    const query = `
      SELECT w.*, 
             COUNT(wb.id) as block_count,
             JSON_AGG(
               JSON_BUILD_OBJECT(
                 'duration', wb.duration,
                 'zone_type', wb.zone_type,
                 'power_target', wb.power_target,
                 'cadence_target', wb.cadence_target,
                 'hr_min', wb.hr_min,
                 'hr_max', wb.hr_max,
                 'terrain_type', wb.terrain_type,
                 'notes', wb.notes
               ) ORDER BY wb.block_order
             ) as blocks
      FROM workouts w
      LEFT JOIN workout_blocks wb ON w.id = wb.workout_id
      WHERE w.user_id = $1
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static async findById(workoutId) {
    const query = `
      SELECT w.*, 
             JSON_AGG(
               JSON_BUILD_OBJECT(
                 'id', wb.id,
                 'block_order', wb.block_order,
                 'duration', wb.duration,
                 'zone_type', wb.zone_type,
                 'power_target', wb.power_target,
                 'power_min', wb.power_min,
                 'power_max', wb.power_max,
                 'cadence_target', wb.cadence_target,
                 'cadence_min', wb.cadence_min,
                 'cadence_max', wb.cadence_max,
                 'hr_min', wb.hr_min,
                 'hr_max', wb.hr_max,
                 'terrain_type', wb.terrain_type,
                 'notes', wb.notes
               ) ORDER BY wb.block_order
             ) as blocks
      FROM workouts w
      LEFT JOIN workout_blocks wb ON w.id = wb.workout_id
      WHERE w.id = $1
      GROUP BY w.id
    `;
    
    const result = await db.query(query, [workoutId]);
    return result.rows[0];
  }

  static async update(workoutId, workoutData, blocks) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Atualiza o workout
      const workoutQuery = `
        UPDATE workouts 
        SET name = $1, description = $2, total_duration = $3, total_tss = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `;
      
      const workoutResult = await client.query(workoutQuery, [
        workoutData.name,
        workoutData.description,
        workoutData.total_duration,
        workoutData.total_tss,
        workoutId
      ]);

      // Remove blocos antigos
      await client.query('DELETE FROM workout_blocks WHERE workout_id = $1', [workoutId]);

      // Insere novos blocos
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const blockQuery = `
          INSERT INTO workout_blocks 
          (workout_id, block_order, duration, zone_type, power_target, power_min, power_max, 
           cadence_target, cadence_min, cadence_max, hr_min, hr_max, terrain_type, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `;
        
        await client.query(blockQuery, [
          workoutId,
          i,
          block.duration,
          block.zone_type,
          block.power_target,
          block.power_min,
          block.power_max,
          block.cadence_target,
          block.cadence_min,
          block.cadence_max,
          block.hr_min,
          block.hr_max,
          block.terrain_type,
          block.notes
        ]);
      }

      await client.query('COMMIT');
      return workoutResult.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(workoutId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Remove blocos primeiro
      await client.query('DELETE FROM workout_blocks WHERE workout_id = $1', [workoutId]);
      
      // Remove o workout
      const result = await client.query('DELETE FROM workouts WHERE id = $1 RETURNING *', [workoutId]);

      await client.query('COMMIT');
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getBlocks(workoutId) {
    const query = `
      SELECT * FROM workout_blocks 
      WHERE workout_id = $1 
      ORDER BY block_order
    `;
    
    const result = await db.query(query, [workoutId]);
    return result.rows;
  }

  static async saveFile(workoutId, fileType, filePath) {
    const query = `
      INSERT INTO workout_files (workout_id, file_type, file_path)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await db.query(query, [workoutId, fileType, filePath]);
    return result.rows[0];
  }
}

module.exports = Workout;