// src/routes/contact.js
import { Router } from 'express';
import { saveMessage } from '../models/contact/messageModel.js';

const router = Router();

router.get('/', (req, res) => {
    res.render('contact', { title: 'Contact Us' });
});

router.post('/', async (req, res) => {
    const { name, email, subject, message: body } = req.body;

    if (!name || !email || !subject || !body) {
        return res.render('contact', {
            title: 'Contact Us',
            error: 'Please fill out all required fields.',
        });
    }

    try {
        await saveMessage({ name, email, subject, body });
        res.render('contact', {
            title: 'Contact Us',
            success: 'Thanks for reaching out! Your message has been sent.',
        });
    } catch (err) {
        console.error('Failed to save message:', err.message);
        res.render('contact', {
            title: 'Contact Us',
            error: 'Something went wrong. Please try again later.',
        });
    }
});

export default router;