import db from './db.js';

// Roles table
const createRolesTable = `
    CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE
    );
`;

// Users table
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role_id INTEGER REFERENCES roles(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

// Create bodyparts table
const createBodyPartsTable = `
    CREATE TABLE IF NOT EXISTS bodyparts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
    );
`;

// Create exercise_types table
const createExerciseTypesTable = `
    CREATE TABLE IF NOT EXISTS exercise_types (
        id SERIAL PRIMARY KEY,
        type_name VARCHAR(100) NOT NULL UNIQUE
    );
`;

// Create exercises table
const createExercisesTable = `
    CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        type_id INTEGER REFERENCES exercise_types(id),
        bodypart_id INTEGER REFERENCES bodyparts(id),
        UNIQUE(name, type_id, bodypart_id)
    );
`;

// Create workouts table
const createWorkoutsTable = `
    CREATE TABLE IF NOT EXISTS workouts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        user_id INTEGER REFERENCES users(id),
        is_custom BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

// Create workout_exercises table (join table)
const createWorkoutExercisesTable = `
    CREATE TABLE IF NOT EXISTS workout_exercises (
        workout_id INTEGER REFERENCES workouts(id) ON DELETE CASCADE,
        exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
        PRIMARY KEY (workout_id, exercise_id)
    );
`;

// Tracks favorite workouts per user
const createUserFavoritesTable = `
    CREATE TABLE IF NOT EXISTS user_favorites (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        workout_id INTEGER REFERENCES workouts(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, workout_id)
    );
`;


const insertRoles = async () => {
    const roles = ['admin', 'customer'];
    for (const role of roles) {
        await db.query(`INSERT INTO roles (role_name) VALUES ($1) ON CONFLICT (role_name) DO NOTHING`, [role]);
    }
};


const setupDatabase = async () => {
    const verbose = process.env.DISABLE_SQL_LOGGING !== 'true';

    try {
        if (verbose) console.log('Setting up workouts database...');

        await db.query(createRolesTable);
        await db.query(createUsersTable);
        if (verbose) console.log('Roles and Users tables ready');

        await insertRoles();

        await db.query(createBodyPartsTable);
        if (verbose) console.log('Bodyparts table ready');

        await db.query(createExerciseTypesTable);
        if (verbose) console.log('Exercise types table ready');

        await db.query(createExercisesTable);
        if (verbose) console.log('Exercises table ready');

        await db.query(createWorkoutsTable);
        if (verbose) console.log('Workouts table ready');

        await db.query(createWorkoutExercisesTable);
        if (verbose) console.log('Workout-Exercises join table ready');

        await db.query(createUserFavoritesTable);
        if (verbose) console.log('User-Favorites table ready');

        if (verbose) console.log('Workouts database setup complete!');
        return true;

    } catch (err) {
        console.error('Database setup error:', err.message);
        throw err;
    }
};

const initialBodyParts = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Full Body'];
const initialExerciseTypes = ['Strength', 'Cardio', 'Mobility', 'Balance'];

const insertBodyPart = async (name) => {
    await db.query(`INSERT INTO bodyparts (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [name]);
};

const insertExerciseType = async (type) => {
    await db.query(`INSERT INTO exercise_types (type_name) VALUES ($1) ON CONFLICT (type_name) DO NOTHING`, [type]);
};

const insertExercise = async (name, description, typeName, bodyPartName) => {
    const typeIdRes = await db.query(`SELECT id FROM exercise_types WHERE type_name = $1`, [typeName]);
    const bodyPartIdRes = await db.query(`SELECT id FROM bodyparts WHERE name = $1`, [bodyPartName]);

    if (typeIdRes.rows.length && bodyPartIdRes.rows.length) {
        const typeId = typeIdRes.rows[0].id;
        const bodyPartId = bodyPartIdRes.rows[0].id;
        await db.query(
            `INSERT INTO exercises (name, description, type_id, bodypart_id) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [name, description, typeId, bodyPartId]
        );
    }
};

const insertWorkout = async (name, description, userId = null, isCustom = false) => {
    const res = await db.query(
        `INSERT INTO workouts (name, description, user_id, is_custom)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
        [name, description, userId, isCustom]
    );
    return res.rows[0].id;
};


const linkExerciseToWorkout = async (workoutId, exerciseName) => {
    const exerciseRes = await db.query(`SELECT id FROM exercises WHERE name = $1`, [exerciseName]);
    if (exerciseRes.rows.length) {
        const exerciseId = exerciseRes.rows[0].id;
        await db.query(
            `INSERT INTO workout_exercises (workout_id, exercise_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [workoutId, exerciseId]
        );
    }
};

const insertInitialData = async () => {
    
    // Insert core reference data
    for (const bp of initialBodyParts) await insertBodyPart(bp);
    for (const et of initialExerciseTypes) await insertExerciseType(et);

    // Insert some exercises
    await insertExercise('Push-Ups', 'A basic upper-body strength exercise.', 'Strength', 'Chest');
    await insertExercise('Squats', 'A lower-body strength movement for legs and glutes.', 'Strength', 'Legs');
    await insertExercise('Burpees', 'Full body cardio with push-up and jump.', 'Cardio', 'Full Body');
    await insertExercise('Plank', 'Core hold position to build endurance.', 'Mobility', 'Core');
    await insertExercise('Jumping Jacks', 'Classic cardio warm-up.', 'Cardio', 'Full Body');
    await insertExercise('Lunges', 'Strengthens legs and balance.', 'Strength', 'Legs');

    // Create workouts and link them to exercises
    const fullBodyId = await insertWorkout('Full Body Burn', 'A high-intensity full-body workout.');
    await linkExerciseToWorkout(fullBodyId, 'Burpees');
    await linkExerciseToWorkout(fullBodyId, 'Push-Ups');
    await linkExerciseToWorkout(fullBodyId, 'Squats');

    const coreId = await insertWorkout('Core Crusher', 'Focuses on core strength and endurance.');
    await linkExerciseToWorkout(coreId, 'Plank');
    await linkExerciseToWorkout(coreId, 'Jumping Jacks');

    const legDayId = await insertWorkout('Leg Day Power', 'All about building lower body strength.');
    await linkExerciseToWorkout(legDayId, 'Lunges');
    await linkExerciseToWorkout(legDayId, 'Squats');
};

/**
 * Tests the database connection by executing a simple query.
 */
const testConnection = async () => {
    try {
        const result = await db.query('SELECT NOW() as current_time');
        console.log('Database connection successful:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

export {
    setupDatabase,
    insertInitialData,
    testConnection
};