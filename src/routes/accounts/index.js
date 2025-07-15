import express from 'express';

import { createUser, authenticateUser, emailExists } from '../../models/accounts/index.js';
import { getUserFavorites } from '../../models/workouts/favorites.js';
import { getUserWorkouts } from '../../models/workouts/userWorkouts.js';

const router = express.Router();

/**
 * Display the login form
 */
router.get('/login', (req, res) => {
    // Check if user is already logged in
    if (req.session.isLoggedIn) {
        return res.redirect('/accounts/dashboard');
    }

    res.render('accounts/login', {
        title: 'Login',
        errors: req.flash('error')
    });
});


/**
 * Process login form submission with real authentication
 */
router.post('/login', async (req, res) => {
    try {
        const { username: email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            req.flash('error', 'Email and password are required');
            return res.render('accounts/login', {
                title: 'Login',
                errors: req.flash('error')
            });
        }

        // Authenticate user
        const user = await authenticateUser(email, password);

        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.render('accounts/login', {
                title: 'Login',
                errors: req.flash('error')
            });
        }

        // Store user information in session
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.loginTime = new Date();

        // Flash success message and redirect
        req.flash('success', `Welcome back! You have successfully logged in.`);
        res.redirect('/accounts/dashboard');

    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.render('accounts/login', {
            title: 'Login',
            errors: req.flash('error')
        });
    }
});

/**
 * Display the user dashboard (protected route)
 */
router.get('/dashboard', async (req, res) => {
    // Check if user is logged in
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Please log in to access the dashboard');
        return res.redirect('/accounts/login');
    }

    try {
        const userId = req.session.user.id;
        const favorites = await getUserFavorites(userId);
        const customWorkouts = await getUserWorkouts(userId);

        res.render('accounts/dashboard', {
            title: 'Account Dashboard',
            user: req.session.user,
            username: req.session.user,
            loginTime: req.session.loginTime,
            favorites,
            customWorkouts
        });
    } catch (err) {
        console.error('Dashboard error:', err.message);
        req.flash('error', 'Something went wrong loading your dashboard.');
        res.redirect('/');
    }
});

/**
 * Process logout request
 */
router.post('/logout', (req, res) => {
    const userEmail = req.session.user?.email;

    // Flash success message and redirect to home
    req.flash('success', `Goodbye, ${userEmail || 'user'}! You have been successfully logged out.`);

    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            req.flash('error', 'Logout failed. Please try again.');
            return res.redirect('/accounts/dashboard');
        }

        // Clear the session cookie
        res.clearCookie('sessionId');

        res.redirect('/');
    });
});

/**
 * Display the registration form
 */
router.get('/register', (req, res) => {
    // Check if user is already logged in
    if (req.session.isLoggedIn) {
        return res.redirect('/accounts/dashboard');
    }

    res.render('accounts/register', {
        title: 'Create Account',
        errors: req.flash('error')
    });
});

/**
 * Process registration form submission
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        // Basic validation
        const errors = [];

        if (!email || !email.includes('@')) {
            errors.push('Valid email address is required');
        }

        if (!password || password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }

        // Check if email already exists
        if (email && await emailExists(email)) {
            errors.push('An account with this email already exists');
        }

        // If validation errors exist, redisplay the form
        if (errors.length > 0) {
            errors.forEach(error => req.flash('error', error));
            return res.render('accounts/register', {
                title: 'Create Account'
            });
        }

        // Create the user account
        const newUser = await createUser({ email, password });

        // Flash success message and redirect to login
        req.flash('success', 'Account created successfully! Please log in with your new credentials.');
        res.redirect('/accounts/login');

    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'An error occurred while creating your account. Please try again.');
        res.render('accounts/register', {
            title: 'Create Account',
            errors: req.flash('error')
        });
    }
});

export default router;