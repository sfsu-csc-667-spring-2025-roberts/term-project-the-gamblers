

const sessionMiddleware = (req, res, next) => {
    if (req.session.userId !== undefined) {
        res.locals.userId = req.session.userId; // Store user ID in res.locals for use in views
        res.locals.username = req.session.username; // Store username in res.locals for use in views
        next();
    } else {
        res.redirect("/auth/login"); // Redirect to login page if user is not logged in
    }
};

export default sessionMiddleware;