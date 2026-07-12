const jwt = require('jsonwebtoken');

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('CRITICAL SECURITY ALERT: JWT_SECRET environment variable is missing.');
    throw new Error('Internal server configuration error.');
  }
  return secret;
};

// Default export verifies admin token
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = getSecret();
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === 'Internal server configuration error.') {
      return res.status(500).json({ error: error.message });
    }
    res.status(400).json({ error: 'Invalid authentication token.' });
  }
};

// Named export for student token validation
module.exports.verifyStudentToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = getSecret();
    const decoded = jwt.verify(token, secret);
    if (decoded.role !== 'student') {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    req.student = decoded;
    next();
  } catch (error) {
    if (error.message === 'Internal server configuration error.') {
      return res.status(500).json({ error: error.message });
    }
    res.status(400).json({ error: 'Invalid authentication token.' });
  }
};
