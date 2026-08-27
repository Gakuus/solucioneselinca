import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/AppError';
import { logger } from '../utils/logger';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      errors: error.errors,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  console.error('Unhandled error:', error.message, error.stack);
  logger.error('Unhandled error:', error.message);

  return res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
  });
}
