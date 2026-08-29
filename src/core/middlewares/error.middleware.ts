import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app.error';
import { logger } from '../../config/logger';
import { env } from '../../config/env';
import { ApiResponse } from '../utils/api-response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    logger.warn({ err: formattedErrors, path: req.path }, 'Validation Error');
    return ApiResponse.error(res, 'Validation failed', 400, formattedErrors);
  }

  if (err instanceof AppError) {
    logger.warn({ err: err.message, path: req.path }, 'Operational Error');
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  logger.error({ err, path: req.path }, 'Unhandled Exception');
  
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return ApiResponse.error(res, message, 500);
};
