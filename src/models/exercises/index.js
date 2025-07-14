import db from '../db.js';

/**
 * Retrieves all exercises with their type and bodypart names.
 */
async function getAllExercises() {
    try {
        const query = `
            SELECT 
                e.id,
                e.name,
                e.description,
                et.type_name AS type,
                bp.name AS bodypart
            FROM exercises e
            LEFT JOIN exercise_types et ON e.type_id = et.id
            LEFT JOIN bodyparts bp ON e.bodypart_id = bp.id
            ORDER BY e.name;
        `;
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching exercises:', error.message);
        throw error;
    }
}

/**
 * Retrieves a single exercise by ID with its type and bodypart names.
 */
async function getExerciseById(id) {
    try {
        const query = `
            SELECT 
                e.id,
                e.name,
                e.description,
                et.type_name AS type,
                bp.name AS bodypart
            FROM exercises e
            LEFT JOIN exercise_types et ON e.type_id = et.id
            LEFT JOIN bodyparts bp ON e.bodypart_id = bp.id
            WHERE e.id = $1;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching exercise by ID:', error.message);
        throw error;
    }
}

/**
 * Adds a new exercise to the database.
 * Expects an object with: name, description, type_id, bodypart_id
 */
async function addExercise({ name, description, type_id, bodypart_id }) {
    try {
        const query = `
            INSERT INTO exercises (name, description, type_id, bodypart_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [name, description, type_id, bodypart_id];
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding exercise:', error.message);
        throw error;
    }
}

export { getAllExercises, getExerciseById, addExercise };
