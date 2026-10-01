const jwt = require('jsonwebtoken');

// Verifies the Bearer token and attaches { userId, name, role } to req.user.
module.exports = function auth(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token, authorization denied.' });
    }
    try {
        const token = authHeader.split(' ')[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid.' });
    }
};
