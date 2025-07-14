import express from 'express';
import db from '../../models/db.js';

const router = express.Router();

/**
 * Middleware to protect admin routes
 */
const requireAdmin = (req, res, next) => {
    if (req.session.user?.role_name !== 'admin') {
        req.flash('error', 'You must be an admin to access this page.');
        return res.redirect('/');
    }
    next();
};

/**
 * GET /workouts/user
 * Show all users (admin only)
 */
router.get('/', requireAdmin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT users.id, email, role_name, created_at
            FROM users
            LEFT JOIN roles ON users.role_id = roles.id
            ORDER BY created_at DESC
        `);
        res.render('admin/users', {
            title: 'User Management',
            users: result.rows
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        req.flash('error', 'Unable to load user list.');
        res.redirect('/');
    }
});

/**
 * POST /workouts/user/delete/:id
 * Delete a user (admin only)
 */
router.post('/delete/:id', requireAdmin, async (req, res) => {
    const userId = req.params.id;
    try {
        await db.query(`DELETE FROM users WHERE id = $1`, [userId]);
        req.flash('success', 'User deleted successfully.');
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error', 'Could not delete user.');
    }
    res.redirect('/workouts/user');
});

export default router;
