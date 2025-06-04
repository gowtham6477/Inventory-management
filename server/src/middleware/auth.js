require('dotenv').config();
const jwt = require('jsonwebtoken');


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
      
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;