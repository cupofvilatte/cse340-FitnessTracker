// Guest = not logged in
export function checkGuest(req, res, next) {
    if (!req.session?.isLoggedIn) {
        return next();
    }
    req.flash('error', 'You are already logged in.');
    res.redirect('/accounts/dashboard');
}

export function checkRole(roles = []) {
    return (req, res, next) => {
        const role = req.session?.user?.role_name;
        if (!req.session?.isLoggedIn || !roles.includes(role)) {
            req.flash('error', 'You do not have access to that page.');
            return res.redirect('/');
        }
        return next();
    };
}
