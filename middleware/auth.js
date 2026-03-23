const auth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    next();
};

const authRedirect = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/account');
    }
    next();
};

module.exports = { auth, authRedirect };
