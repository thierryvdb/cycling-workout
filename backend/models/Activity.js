const db = require('../config/database');

class Activity {
  static async create(activityData) {
    const {
      user_id, strava_id, name, type, sport_type, start_date, distance,
      moving_time, elapsed_time, total_elevation_gain, average_speed,
      max_speed, average_cadence, average_watts, average_heartrate,
      max_heartrate, tss, kilojoules, map_polyline
    } = activityData;

    const query = `
      INSERT INTO activities (
        user_id, strava_id, name, type, sport_type, start_date, distance,
        moving_time, elapsed_time, total_elevation_gain, average_speed,
        max_speed, average_cadence, average_watts, average_heartrate,
        max_heartrate, tss, kilojoules, map_polyline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT (user_id, strava_id) DO NOTHING
      RETURNING *;
    `;

    const values = [
      user_id, strava_id, name, type, sport_type, start_date, distance,
      moving_time, elapsed_time, total_elevation_gain, average_speed,
      max_speed, average_cadence, average_watts, average_heartrate,
      max_heartrate, tss, kilojoules, map_polyline
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async createMany(activities) {
    // Esta função pode ser otimizada para um único insert com múltiplos valores
    // mas por simplicidade, vamos iterar.
    const createdActivities = [];
    for (const activityData of activities) {
      const newActivity = await this.create(activityData);
      if (newActivity) {
        createdActivities.push(newActivity);
      }
    }
    return createdActivities;
  }

  static async findByUserId(userId, { limit = 50, offset = 0 } = {}) {
    const query = `
      SELECT * FROM activities
      WHERE user_id = $1
      ORDER BY start_date DESC
      LIMIT $2 OFFSET $3;
    `;
    const { rows } = await db.query(query, [userId, limit, offset]);
    return rows;
  }

  static async findById(activityId) {
    const query = 'SELECT * FROM activities WHERE id = $1;';
    const { rows } = await db.query(query, [activityId]);
    return rows[0];
  }

  static async findByStravaId(stravaId) {
    const query = 'SELECT * FROM activities WHERE strava_id = $1;';
    const { rows } = await db.query(query, [stravaId]);
    return rows[0];
  }

  static async findLastSyncTimestamp(userId) {
    const query = `
      SELECT start_date FROM activities
      WHERE user_id = $1
      ORDER BY start_date DESC
      LIMIT 1;
    `;
    const { rows } = await db.query(query, [userId]);
    return rows[0] ? new Date(rows[0].start_date).getTime() / 1000 : null;
  }
}

module.exports = Activity;