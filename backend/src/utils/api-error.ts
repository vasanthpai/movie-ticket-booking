/**
 * An error we throw on purpose, carrying the HTTP status and a stable,
 * machine-readable code for the client (e.g. "MOVIE_NOT_FOUND").
 *
 * Anything thrown that is NOT an ApiError is treated as an unexpected bug
 * and returned as a generic 500 — see middleware/error-handler.ts.
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, details?: unknown, code = 'BAD_REQUEST') {
    return new ApiError(400, code, message, details);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED') {
    return new ApiError(401, code, message);
  }

  static forbidden(
    message = 'You do not have permission to do this',
    code = 'FORBIDDEN',
  ) {
    return new ApiError(403, code, message);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new ApiError(404, code, message);
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new ApiError(409, code, message);
  }
}
