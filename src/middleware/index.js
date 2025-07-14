export const addGlobalData = async (req, res, next) => {
    
    // Get the current year for copyright notice
    res.locals.currentYear = new Date().getFullYear();

    // Add NODE_ENV for all views
    res.locals.NODE_ENV = process.env.NODE_ENV || 'development';

    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };

    // Adding to res.locals makes this available to all views automatically
    res.locals.timestamp = now.toLocaleDateString('en-US', options);

    next();
};