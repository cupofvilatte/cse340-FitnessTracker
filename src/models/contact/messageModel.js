// src/models/contact/messageModel.js
import db from '../db.js';

export async function saveMessage({ name, email, subject, body }) {
    const result = await db.query(
        `INSERT INTO messages (name, email, subject, body)
        VALUES ($1, $2, $3, $4)
        RETURNING *;`,
        [name, email, subject, body]
    );
    return result.rows[0];
}

// Get all messages, newest first
export async function getAllMessages() {
    const result = await db.query(`
        SELECT * FROM messages
        ORDER BY created_at DESC
    `);
    return result.rows;
}

// Get a single message by ID
export async function getMessageById(id) {
    const result = await db.query(
        `SELECT * FROM messages WHERE id = $1`,
        [id]
    );
    return result.rows[0];
}

// Delete a message by ID
export async function deleteMessage(id) {
    await db.query(
        `DELETE FROM messages WHERE id = $1`,
        [id]
    );
}