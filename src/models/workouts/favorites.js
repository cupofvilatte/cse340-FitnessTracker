import db from '../db.js';

/**
 * Adds a workout to a user's favorites
 * @param {number} userId - ID of the user
 * @param {number} workoutId - ID of the workout
 */
async function addFavorite(userId, workoutId) {
    const query = `
        INSERT INTO user_favorites (user_id, workout_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
    `;
    try {
        await db.query(query, [userId, workoutId]);
    } catch (err) {
        console.error('Error adding favorite workout:', err.message);
        throw err;
    }
}

/**
 * Removes a workout from a user's favorites
 * @param {number} userId 
 * @param {number} workoutId 
 */
async function removeFavorite(userId, workoutId) {
    const query = `
        DELETE FROM user_favorites
        WHERE user_id = $1 AND workout_id = $2;
    `;
    try {
        await db.query(query, [userId, workoutId]);
    } catch (err) {
        console.error('Error removing favorite workout:', err.message);
        throw err;
    }
}

/**
 * Retrieves all favorite workouts for a user
 * @param {number} userId 
 * @returns {Array} List of favorite workouts
 */
async function getUserFavorites(userId) {
    const query = `
        SELECT w.id, w.name, w.description, w.created_at
        FROM workouts w
        JOIN user_favorites uf ON uf.workout_id = w.id
        WHERE uf.user_id = $1;
    `;
    try {
        const result = await db.query(query, [userId]);
        return result.rows;
    } catch (err) {
        console.error('Error fetching favorite workouts:', err.message);
        throw err;
    }
}

export {
    addFavorite,
    removeFavorite,
    getUserFavorites
};
