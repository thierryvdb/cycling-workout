const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password_hash, name, ftp, vo2max, max_heart_rate, weight, birth_date } = userData;
    
    const query = `
      INSERT INTO users (email, password_hash, name, ftp, vo2max, max_heart_rate, weight, birth_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, name, ftp, vo2max, max_heart_rate, weight, birth_date, created_at
    `;
    
    const values = [email, password_hash, name, ftp, vo2max, max_heart_rate, weight, birth_date];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateStravaData(userId, stravaData) {
    const allowedFields = [
      'strava_id', 'strava_access_token', 'strava_refresh_token', 
      'strava_token_expires_at', 'last_sync_at'
    ];
    
    const updates = {};
    Object.keys(stravaData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = stravaData[key];
      }
    });

    if (Object.keys(updates).length === 0) return null;

    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const values = Object.values(updates);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async updateLastSync(userId) {
    const query = `
      UPDATE users 
      SET last_sync_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async updateAutoSync(userId, enabled) {
    const query = `
      UPDATE users 
      SET auto_sync_enabled = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [enabled, userId]);
    return result.rows[0];
  }

  static async getUsersWithStrava() {
    const query = `
      SELECT id, name, email, strava_id, last_sync_at, auto_sync_enabled, status
      FROM users 
      WHERE strava_access_token IS NOT NULL 
        AND status = 'active'
      ORDER BY name
    `;

    const result = await db.query(query);
    return result.rows;
  }

  static async getWorkoutsByDateRange(userId, startDate, endDate) {
    const query = `
      SELECT * FROM workouts 
      WHERE user_id = $1 
        AND created_at BETWEEN $2 AND $3
      ORDER BY created_at DESC
    `;

    const result = await db.query(query, [
      userId, 
      startDate.toISOString(), 
      endDate.toISOString()
    ]);
    return result.rows;
  }

  static async calculatePowerZones(userId, ftp) {
    const zones = [
      { name: 'Active Recovery', min: 0, max: 55, color: '#4CAF50' },
      { name: 'Endurance', min: 56, max: 75, color: '#8BC34A' },
      { name: 'Tempo', min: 76, max: 90, color: '#FFC107' },
      { name: 'Threshold', min: 91, max: 105, color: '#FF9800' },
      { name: 'VO2 Max', min: 106, max: 120, color: '#F44336' },
      { name: 'Anaerobic', min: 121, max: 150, color: '#D32F2F' },
      { name: 'Neuromuscular', min: 151, max: 200, color: '#B71C1C' }
    ];

    // Remove zonas antigas
    await db.query('DELETE FROM user_power_zones WHERE user_id = $1', [userId]);

    // Insere novas zonas
    for (const zone of zones) {
      const query = `
        INSERT INTO user_power_zones (user_id, zone_name, power_min, power_max, color)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await db.query(query, [
        userId, 
        zone.name, 
        Math.round(ftp * zone.min / 100), 
        Math.round(ftp * zone.max / 100), 
        zone.color
      ]);
    }
  }

  static async getPowerZones(userId) {
    const query = 'SELECT * FROM user_power_zones WHERE user_id = $1 ORDER BY power_min';
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  // Hash password
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;