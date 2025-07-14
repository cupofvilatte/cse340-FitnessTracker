// Sample workout data structure
const workoutsData = {
    workouts: {
        1: {
            name: 'Full Body Burn',
            description: 'A high-intensity full-body workout targeting all major muscle groups.',
            exercises: {
                101: {
                    name: 'Burpees',
                    description: 'A full-body exercise that combines squats, push-ups, and jumps.',
                    type: 'Cardio',
                    bodypart: 'Full Body'
                },
                102: {
                    name: 'Push-Ups',
                    description: 'A strength exercise targeting chest, shoulders, and triceps.',
                    type: 'Strength',
                    bodypart: 'Chest'
                },
                103: {
                    name: 'Squats',
                    description: 'A foundational leg exercise strengthening quads and glutes.',
                    type: 'Strength',
                    bodypart: 'Legs'
                }
            }
        },
        2: {
            name: 'Core Crusher',
            description: 'Focuses on building strong abdominal and lower back muscles.',
            exercises: {
                201: {
                    name: 'Plank',
                    description: 'An isometric core exercise that improves stability.',
                    type: 'Mobility',
                    bodypart: 'Core'
                },
                202: {
                    name: 'Bicycle Crunches',
                    description: 'Targets upper and lower abs as well as obliques.',
                    type: 'Cardio',
                    bodypart: 'Core'
                },
                203: {
                    name: 'Mountain Climbers',
                    description: 'Cardio-intensive core movement with full-body engagement.',
                    type: 'Cardio',
                    bodypart: 'Core'
                }
            }
        }
    }
};

// Get all workouts
export const getAllWorkouts = async () => Promise.resolve(workoutsData.workouts);

// Get workout by ID
export const getWorkout = async (workoutId) => {
    return Promise.resolve(workoutsData.workouts[workoutId] || null);
};

// Get all exercises for a workout
export const getWorkoutExercises = async (workoutId) => {
    const workout = await getWorkout(workoutId);
    return workout ? workout.exercises : null;
};

// Get individual exercise in a workout
export const getExercise = async (workoutId, exerciseId) => {
    const workout = await getWorkout(workoutId);
    return workout ? workout.exercises[exerciseId] || null : null;
};

// Get a random workout
export const getRandomWorkout = async () => {
    const ids = Object.keys(workoutsData.workouts);
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    return {
        id: randomId,
        ...workoutsData.workouts[randomId]
    };
};