import { Router } from 'express';
import { getWorkoutById, getExercisesByWorkoutId } from '../../models/workouts/index.js';

const router = Router();

router.get('/', async (req, res) => {
    const workoutId = req.query.workoutId;

    if (!workoutId) {
        req.flash('error', 'No workout ID provided');
        return res.redirect('/workouts');
    }

    try {
        const workout = await getWorkoutById(workoutId); // Your function to get a single workout
        const exercises = await getExercisesByWorkoutId(workoutId); // Your function to get exercises

        res.render('exercises', {
            title: workout.name,
            workout,
            exercises
        });
    } catch (error) {
        console.error('Error loading workout details:', error);
        req.flash('error', 'Could not load workout details');
        res.redirect('/workouts');
    }
});

export default router;