import type { Request, Response, NextFunction } from 'express';
import { isProduction } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';
import { sendError } from '../utils/api-response.js';

/**
 * The single place where errors become HTTP responses.
 *
 * Express recognises error-handling middleware by its FOUR parameters, so
 * `_next` must stay in the signature even though it's unused.
 *
 * In Express 5, an error thrown (or a rejected promise) in any route handler
 * is forwarded here automatically.
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  // 1. Errors we threw on purpose: safe to show to the client.
  if (error instanceof ApiError) {
    return sendError(res, error.statusCode, {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined && { details: error.details }),
    });
  }

  // 2. Problems reading the request body, raised by express.json()
  //    (e.g. malformed JSON → 400, body over the size limit → 413).
  if (isBodyParserError(error)) {
    const known = BODY_PARSER_ERRORS[error.type];
    return sendError(res, error.status, {
      code: known?.code ?? 'BAD_REQUEST',
      message: known?.message ?? 'Request body could not be read',
    });
  }

  // 3. Anything else is a bug. Log everything server-side, but never send
  //    internal details (stack traces, DB messages) to the client in production.
  console.error(`❌ Unhandled error on ${req.method} ${req.originalUrl}:`, error);

  return sendError(res, 500, {
    code: 'INTERNAL_SERVER_ERROR',
    message:
      !isProduction && error instanceof Error ? error.message : 'Something went wrong',
  });
}

const BODY_PARSER_ERRORS: Record<string, { code: string; message: string }> = {
  'entity.parse.failed': {
    code: 'INVALID_JSON',
    message: 'Request body is not valid JSON',
  },
  'entity.too.large': { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large' },
};

// body-parser errors carry a numeric `status` and a string `type` like "entity.parse.failed".
type BodyParserError = Error & { status: number; type: string };

function isBodyParserError(error: unknown): error is BodyParserError {
  return (
    error instanceof Error &&
    'type' in error &&
    typeof error.type === 'string' &&
    'status' in error &&
    typeof error.status === 'number' &&
    error.status >= 400 &&
    error.status < 500
  );
}
