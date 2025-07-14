import db from '../db.js';

export async function getUserWorkouts(userId) {
    const query = `
        SELECT id, name, description, created_at
        FROM workouts
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
}
