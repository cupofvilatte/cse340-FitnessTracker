import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

import session from 'express-session';
import pgSession from 'connect-pg-simple';

import db from './src/models/db.js';
import flash from 'connect-flash';

// import routes
import indexRoutes from './src/routes/index.js';

import contactRoutes from './src/routes/contact.js';
import aboutRoutes from './src/routes/about.js';

import workoutRoutes from './src/routes/workouts/index.js';
import exerciseRoutes from './src/routes/exercises/index.js';

import accountRoutes from './src/routes/accounts/index.js';
import createWorkoutRoutes from './src/routes/dashboard/workouts.js';
import favoritesRoutes from './src/routes/favorites/index.js';

import adminUserRoutes from './src/routes/admin/user.js';
import adminMessageRoutes from './src/routes/admin/messages.js';

// import middleware
import { addGlobalData } from './src/middleware/index.js';
import { insertInitialData, setupDatabase, testConnection } from './src/models/setup.js';
import { seedAdmin } from './src/models/seedAdmin.js';

// define filename config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// define NODE_ENV variable, otherwise use 'production'
const NODE_ENV = process.env.NODE_ENV || 'production';

// define PORT variable, otherwise use 3000
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true}));

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'src/views'));

// Configure PostgreSQL session store
const PostgresStore = pgSession(session);

// Configure session middleware
app.use(session({
    store: new PostgresStore({
        pool: db, // Use your PostgreSQL connection
        tableName: 'sessions', // Table name for storing sessions
        createTableIfMissing: true // Creates table if it does not exist
    }),
    secret: process.env.SESSION_SECRET || "default-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true, // Prevents client-side access to the cookie
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    }
}));

app.use(flash());

app.use((req, res, next) => {
    // Pass flash messages grouped by type to locals
    res.locals.flash = [];

    // get success and error messages
    const successMessages = req.flash('success').map(msg => ({ type: 'success', message: msg }));
    const errorMessages = req.flash('error').map(msg => ({ type: 'error', message: msg }));

    res.locals.flash = [...successMessages, ...errorMessages];
    
    next();
});

// implement global middleware
app.use(addGlobalData);

// use routes
app.use(indexRoutes);

app.use('/contact', contactRoutes);

app.use('/about', aboutRoutes);

app.use('/workouts', workoutRoutes);
app.use('/exercises', exerciseRoutes);

app.use('/accounts', accountRoutes);
app.use('/dashboard', createWorkoutRoutes);
app.use('/favorites', favoritesRoutes);

app.use('/admin/users', adminUserRoutes);
app.use('/admin/messages', adminMessageRoutes);

// 404 Error Handler
app.use((req, res, next) => {
    // Ignore error forwarding for expected missing assets
    const quiet404s = [
        '/favicon.ico',
        '/robots.txt'
    ];

    // Also skip any paths under /.well-known/
    const isQuiet404 = quiet404s.includes(req.path) || req.path.startsWith('/.well-known/');

    if (isQuiet404) {
        return res.status(404).send('Not Found');
    }

    // For all other routes, forward to the global error handler
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    // Log the error for debugging
    console.error(err.stack);

    // Set default status and determine error type
    const status = err.status || 500;
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Internal Server Error',
        error: err.message,
        stack: err.stack,
    };

    // Render the appropriate template based on status code
    res.status(status).render(`errors/${status === 404 ? '404' : '500'}`, context);
});

// When in development mode, start a WebSocket server for live reloading
if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');

    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

// listen on port to run app
app.listen(PORT, async () => {
    try {
        await testConnection();
        console.log('Database successfully connected!');
        // await setupDatabase();
        // await insertInitialData();
        // await seedAdmin();
        // console.log('Database seeded with sample data!');

    } catch (error) {
        console.error('Database setup failed', error);
        process.exit(1);
    }
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});