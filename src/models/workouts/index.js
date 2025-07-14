import db from '../db.js';

/**
 * Retrieves all workouts ordered by name.
 */
async function getAllWorkouts() {
    try {
        const query = 'SELECT * FROM workouts ORDER BY name';
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching workouts:', error.message);
        throw error;
    }
}

/**
 * Retrieves a single workout by ID.
 */
async function getWorkoutById(id) {
    try {
        const query = 'SELECT * FROM workouts WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching workout by ID:', error.message);
        throw error;
    }
}

/**
 * Retrieves exercises for a given workout, including type and body part info.
 */
async function getExercisesByWorkoutId(workoutId) {
    try {
        const query = `
            SELECT 
                e.id,
                e.name,
                e.description,
                et.type_name AS type,
                bp.name AS bodypart
            FROM workout_exercises we
            JOIN exercises e ON we.exercise_id = e.id
            LEFT JOIN exercise_types et ON e.type_id = et.id
            LEFT JOIN bodyparts bp ON e.bodypart_id = bp.id
            WHERE we.workout_id = $1
            ORDER BY e.name;
        `;
        const result = await db.query(query, [workoutId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching exercises for workout:', error.message);
        throw error;
    }
}

/**
 * Optionally get the N most recent workouts.
 */
async function getRecentWorkouts(limit = 5) {
    try {
        const query = `
            SELECT * FROM workouts
            ORDER BY created_at DESC
            LIMIT $1;
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching recent workouts:', error.message);
        throw error;
    }
}

/**
 * Retrieves a random workout.
 */
async function getRandomWorkout() {
    try {
        const query = `
            SELECT * FROM workouts
            ORDER BY RANDOM()
            LIMIT 1;
        `;
        const result = await db.query(query);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching random workout:', error.message);
        throw error;
    }
}

export {
    getAllWorkouts,
    getWorkoutById,
    getExercisesByWorkoutId,
    getRecentWorkouts,
    getRandomWorkout
};
