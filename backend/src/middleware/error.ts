import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  // Structured logs for audit tracking
  console.error(`[errorHandler.ts:errorHandler] Error: ${message}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Unique constraint error from Mongo (e.g. duplicate email)
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate field value entered. A record with this unique attribute already exists.'
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const fields = Object.keys(err.errors).map(key => err.errors[key].message);
    return res.status(400).json({
      error: 'Validation failed.',
      details: fields
    });
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
