// src/routes/about.js
import express from 'express';

const router = express.Router();

/**
 * Display the About page
 */
router.get('/', (req, res) => {
  res.render('about', {
    title: 'About Us'
  });
});

export default router;
