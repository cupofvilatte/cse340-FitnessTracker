// src/models/seedAdmin.js
import db from './db.js';
import bcrypt from 'bcrypt';

export async function seedAdmin() {
    try {
        const email = 'admin@example.com';
        const plainPassword = 'Admin123!'; // Change after first login
        const hashedPassword = await bcrypt.hash(plainPassword, 12);

        // Get admin role ID
        const roleResult = await db.query(`SELECT id FROM roles WHERE role_name = 'admin'`);
        if (!roleResult.rows.length) throw new Error("Admin role not found. Did you run setup first?");
        const roleId = roleResult.rows[0].id;

        // Insert admin user
        const result = await db.query(
            `INSERT INTO users (email, password, role_id)
                VALUES ($1, $2, $3)
                ON CONFLICT (email) DO NOTHING
                RETURNING id, email`,
            [email, hashedPassword, roleId]
        );

        if (result.rows.length) {
            console.log('✅ Admin user created:', result.rows[0].email);
        } else {
            console.log('ℹ️ Admin already exists. No changes made.');
        }

    } catch (err) {
        console.error('❌ Error seeding admin:', err);
    }
}
