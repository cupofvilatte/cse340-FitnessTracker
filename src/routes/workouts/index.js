import { Router } from 'express';
import { getAllWorkouts, getWorkoutById, getExercisesByWorkoutId } from '../../models/workouts/index.js';
import { getUserFavorites } from '../../models/workouts/favorites.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const display = req.query.display === 'details' ? 'details' : 'grid';

        const workouts = await getAllWorkouts();

        for (const workout of workouts) {
            const exercises = await getExercisesByWorkoutId(workout.id);
            workout.exercises = exercises;
        }

        const user = req.session.user;

        let favoriteIds = [];

        if (user) {
            const favorites = await getUserFavorites(user.id);
            favoriteIds = favorites.map(fav => fav.id);
        }

        res.render('workouts', {
            title: 'All Workouts',
            workouts,
            display,
            user,
            favoriteIds
        });
    } catch (error) {
        console.error('Error loading workouts:', error.message);
        res.status(500).send('Server error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const workout = await getWorkoutById(id);
        const exercises = await getExercisesByWorkoutId(id);

        if (!workout) {
            return res.status(404).render('404', { message: 'Workout not found' });
        }

        res.render('workouts/exercises', {
            title: workout.name,
            workout,
            exercises,
            timestamp: new Date().toLocaleString()
        });
    } catch (error) {
        console.error('Error showing workout:', error.message);
        res.status(500).send('Server error');
    }
});

export default router;