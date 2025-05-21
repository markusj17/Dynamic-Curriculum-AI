const jwt = require('jsonwebtoken');
const { User, Employee, Company } = require('../models'); 

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.id || !decoded.role) {
        console.warn("Auth Middleware: Token decoded but missing id or role.", decoded);
        return res.status(401).json({ message: 'Not authorized, token incomplete' });
      }

      if (decoded.role === 'ld_manager') {
        req.user = await User.findByPk(decoded.id, { 
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Company, as: 'company', attributes: ['id', 'name'] }] 
        });
        if (req.user) {
            req.user.role = 'ld_manager';
        }
      } else if (decoded.role === 'employee') {

        req.user = await Employee.findByPk(decoded.id, { 
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Company, as: 'company', attributes: ['id', 'name'] }]
        });
        if (req.user) {
            req.user.role = 'employee';

        }
      } else {
        console.warn("Auth Middleware: Unknown role in token.", decoded.role);
        req.user = null; 
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user or employee not found for token credentials.' });
      }
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message, error.name);
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token is invalid or expired.' });
      }
      
      return res.status(500).json({ message: 'Authentication error on server.' });
    }
  } else { 
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access Denied: Your role (${req.user ? req.user.role : 'unknown'}) is not authorized for this resource.` });
        }
        next();
    };
};

module.exports = { protect, authorize };