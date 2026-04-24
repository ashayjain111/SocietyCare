const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ error: 'Validation error', details: errors });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = Object.keys(err.fields);
    return res.status(409).json({ error: `${fields.join(', ')} already exists.` });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
