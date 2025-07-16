// src/routes/admin/messages.js
import { Router } from 'express';
import { getAllMessages, getMessageById, deleteMessage } from '../../models/contact/messageModel.js';

const router = Router();

// Middleware to restrict to admins only
const ensureAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role_name !== 'admin') {
        return res.status(403).render('errors/403', { title: 'Access Denied' });
    }
    next();
};

// GET /admin/messages - list all messages
router.get('/', ensureAdmin, async (req, res) => {
    try {
        const messages = await getAllMessages();
        res.render('admin/messages/index', {
            title: 'Submitted Messages',
            messages
        });
    } catch (err) {
        console.error('Failed to load messages:', err.message);
        res.status(500).render('500', { title: 'Server Error' });
    }
});

// GET /admin/messages/:id - view one message
router.get('/:id', ensureAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const message = await getMessageById(id);

        if (!message) {
            return res.status(404).render('404', { title: 'Message Not Found' });
        }

        res.render('admin/messages/detail', {
            title: `Message from ${message.name}`,
            message
        });
    } catch (err) {
        console.error('Error loading message:', err.message);
        res.status(500).render('500', { title: 'Server Error' });
    }
});

// POST /admin/messages/:id/delete - delete message
router.post('/:id/delete', ensureAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await deleteMessage(id);
        req.flash('success', 'Message deleted.');
        res.redirect('/admin/messages');
    } catch (err) {
        console.error('Error deleting message:', err.message);
        req.flash('error', 'Failed to delete message.');
        res.redirect('/admin/messages');
    }
});

export default router;
