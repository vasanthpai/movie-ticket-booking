import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error.js';

/**
 * Runs only if no route matched. Registered after all routes in app.ts.
 * It forwards an ApiError so 404s get the same JSON shape as every other error.
 */
export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(
    ApiError.notFound(
      `Route ${req.method} ${req.originalUrl} not found`,
      'ROUTE_NOT_FOUND',
    ),
  );
}
