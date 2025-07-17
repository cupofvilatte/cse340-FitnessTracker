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

export async function createWorkout(userId, name, description) {
    const query = `
        INSERT INTO workouts (user_id, name, description, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id
    `;
    const values = [userId, name, description];
    const result = await db.query(query, values);
    return result.rows[0]; // Return created workout ID
}