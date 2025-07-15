import express from 'express';
import db from '../../models/db.js';
import bcrypt from 'bcrypt';

const saltRounds = 12;

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

// Show the create user form
router.get('/create', requireAdmin, (req, res) => {
    res.render('admin/users/create', {
        title: 'Create User',
    });
});

router.post('/create', requireAdmin, async (req, res) => {
    const { email, password, role_name = 'customer' } = req.body;

    if (!email || !password) {
        req.flash('error', 'Email and password are required.');
        return res.redirect('/admin/users/create');
    }

    try {
        // Get role_id from role_name
        const roleResult = await db.query(
            `SELECT id FROM roles WHERE role_name = $1`, [role_name]
        );

        if (!roleResult.rows.length) {
            req.flash('error', 'Invalid role selected.');
            return res.redirect('/admin/users/create');
        }

        const roleId = roleResult.rows[0].id;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        await db.query(
            `INSERT INTO users (email, password, role_id) VALUES ($1, $2, $3)`,
            [email, hashedPassword, roleId]
        );

        req.flash('success', 'User created successfully!');
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error creating user:', error);
        req.flash('error', 'Failed to create user.');
        res.redirect('/admin/users/create');
    }
});

// Show the edit user form
router.get('/edit/:id', requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await db.query(`
            SELECT users.id, email, role_name
            FROM users
            LEFT JOIN roles ON users.role_id = roles.id
            WHERE users.id = $1
        `, [userId]);

        if (!result.rows.length) {
            req.flash('error', 'User not found.');
            return res.redirect('/admin/users');
        }

        res.render('admin/users/edit', {
            title: 'Edit User',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error loading user for edit:', error);
        req.flash('error', 'Unable to load user.');
        res.redirect('/admin/users');
    }
});

router.post('/edit/:id', requireAdmin, async (req, res) => {
    const userId = req.params.id;
    const { email, password, role_name } = req.body;

    try {
        // If password field is empty, don't update the password
        let updateQuery, values;

        if (password && password.trim() !== '') {
            // Hash the new password
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            updateQuery = `
                UPDATE users
                SET email = $1, password = $2, role_id = (SELECT id FROM roles WHERE role_name = $3)
                WHERE id = $4
            `;
            values = [email, hashedPassword, role_name, userId];
        } else {
            // Update email and role only
            updateQuery = `
                UPDATE users
                SET email = $1, role_id = (SELECT id FROM roles WHERE role_name = $2)
                WHERE id = $3
            `;
            values = [email, role_name, userId];
        }

        await db.query(updateQuery, values);

        req.flash('success', 'User updated successfully!');
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error updating user:', error);
        req.flash('error', 'Failed to update user.');
        res.redirect(`/admin/users/edit/${userId}`);
    }
});


/**
 * POST /admin/users/delete/:id
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
    res.redirect('/admin/users');
});

export default router;
