require('dotenv').config();
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT tokens.
 * Reads the token from the Authorization header in the format: "Bearer <token>"
 * If valid, attaches the decoded payload to req.user and calls next().
 * Otherwise, responds with 401 Unauthorized or 403 Forbidden.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid authorization header format. Format is "Bearer <token>"' });
  }

  const token = parts[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Token is invalid or expired
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    // Attach decoded payload to request object
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;