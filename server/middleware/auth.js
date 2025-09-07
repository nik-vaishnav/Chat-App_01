const jwt = require('jsonwebtoken');
const { sendErrorResponse } = require('../utils/responseHelper');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token || 
    (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

  if (!token) {
    return sendErrorResponse(res, 403, "No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendErrorResponse(res, 401, "Token expired");
    }
    if (err.name === 'JsonWebTokenError') {
      return sendErrorResponse(res, 401, "Invalid token");
    }
    return sendErrorResponse(res, 500, "Failed to authenticate token");
  }
};

module.exports = { verifyToken };