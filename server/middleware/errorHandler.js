const { sendErrorResponse } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return sendErrorResponse(res, 400, errors.join(', '));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendErrorResponse(res, 400, `${field} already exists`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendErrorResponse(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendErrorResponse(res, 401, 'Token expired');
  }

  // Default error
  sendErrorResponse(res, 500, "Something went wrong!");
};

const notFoundHandler = (req, res) => {
  sendErrorResponse(res, 404, "Route not found");
};

module.exports = { errorHandler, notFoundHandler };