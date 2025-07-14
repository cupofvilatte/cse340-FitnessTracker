import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('contact', { title: 'Contact Page' });
});

export default router;