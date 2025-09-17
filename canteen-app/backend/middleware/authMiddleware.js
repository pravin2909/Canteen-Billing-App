const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from the header
    const authHeader = req.header('Authorization');

    // Check if not token
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // The header format is "Bearer TOKEN"
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user from payload to the request object
        req.user = decoded;
        next(); // Move on to the next middleware or the route handler
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};