function notFound(req, res, next) {
  res.status(404).json({ success: false, data: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

function errorHandler(err, req, res, next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    success: false,
    data: {
      message: err.message || "Server error",
    },
  });
}

module.exports = { notFound, errorHandler };

