const jwt = require('jsonwebtoken');

const protect = (roles = []) => {
  return (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        // Role check
        if (roles.length && !roles.includes(decoded.role)) {
          return res.status(403).json({ message: 'Not authorized' });
        }

        next(); // ✅ VERY IMPORTANT
      } catch (err) {
        return res.status(401).json({ message: 'Token failed' });
      }
    } else {
      return res.status(401).json({ message: 'No token' });
    }
  };
};

module.exports = { protect };