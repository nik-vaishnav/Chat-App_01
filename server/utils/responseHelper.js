const sendSuccessResponse = (res, statusCode = 200, message = "Success", data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendErrorResponse = (res, statusCode = 500, message = "Error", errors = null) => {
  return res.status(statusCode).json({
    success: false,
    error: true,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

module.exports = { sendSuccessResponse, sendErrorResponse };