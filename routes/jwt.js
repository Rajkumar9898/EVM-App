const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
        console.log('jwtMiddleware applied on route:', req.method, req.originalUrl);
    const authorizationHeader = req.headers['authorization'];
    if (!authorizationHeader) {
        return res.status(401).json({ message: 'No authorization header provided' });
    }
    const token = authorizationHeader.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        req.user = decoded; // Attach user info to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

//function to generate JWT token
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET)
}
module.exports = {jwtMiddleware, generateToken};