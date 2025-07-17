// routes/dashboard.js or similar
import express from 'express';
const router = express.Router();

import { createWorkout, getUserWorkouts } from '../../models/workouts/userWorkouts.js';

// Middleware to protect routes
function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'You must be logged in to access that page.');
    return res.redirect('/accounts/login');
  }
  next();
}

// GET - Show workout creation form
router.get('/workouts/create', requireLogin, (req, res) => {
  res.render('dashboard/add-workout', {
    title: 'Create Custom Workout'
  });
});

// POST - Save custom workout
router.post('/workouts/create', requireLogin, async (req, res) => {
  const { name, description } = req.body;
  const userId = req.session.user.id;

  if (!name || !description) {
    req.flash('error', 'Workout name and description are required.');
    return res.redirect('/dashboard/workouts/create');
  }

  try {
    await createWorkout(userId, name, description); // Use the model function

    req.flash('success', 'Custom workout created!');
    res.redirect('/accounts/dashboard');
  } catch (err) {
    console.error('Error saving workout:', err);
    req.flash('error', 'Something went wrong creating the workout.');
    res.redirect('/dashboard/workouts/create');
  }
});


export default router;