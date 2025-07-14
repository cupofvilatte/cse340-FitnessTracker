import express from 'express';
import { addFavorite, removeFavorite, getUserFavorites } from '../../models/workouts/favorites.js';
import { checkRole } from '../../middleware/auth.js';

const router = express.Router();

// 👤 Middleware: Allow only logged-in users with role "customer"
const allowCustomers = checkRole(['customer']);

/**
 * GET /favorites
 * Show list of user's favorite workouts
 */
router.get('/', allowCustomers, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const favorites = await getUserFavorites(userId);

        res.render('favorites/index', {
            title: 'My Favorite Workouts',
            workouts: favorites
        });
    } catch (err) {
        console.error('Error loading favorites:', err.message);
        req.flash('error', 'Could not load your favorite workouts.');
        res.redirect('/accounts/dashboard');
    }
});

/**
 * POST /favorites/add/:workoutId
 * Add a workout to favorites
 */
router.post('/add/:workoutId', allowCustomers, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const workoutId = parseInt(req.params.workoutId, 10);

        await addFavorite(userId, workoutId);
        req.flash('success', 'Workout added to favorites!');
    } catch (err) {
        console.error('Error adding to favorites:', err.message);
        req.flash('error', 'Could not add workout to favorites.');
    }
    res.redirect('back');
});

/**
 * POST /favorites/remove/:workoutId
 * Remove a workout from favorites
 */
router.post('/remove/:workoutId', allowCustomers, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const workoutId = parseInt(req.params.workoutId, 10);

        await removeFavorite(userId, workoutId);
        req.flash('success', 'Workout removed from favorites.');
    } catch (err) {
        console.error('Error removing from favorites:', err.message);
        req.flash('error', 'Could not remove workout from favorites.');
    }
    res.redirect('back');
});

export default router;
