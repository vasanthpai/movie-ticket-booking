import type { Response } from 'express';

/**
 * The one response shape every endpoint uses, so the frontend can always
 * check `success` first and then read either `data` or `error`.
 */
export type ApiSuccess<T> = { success: true; data: T };

export type ApiFailure = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  const body: ApiSuccess<T> = { success: true, data };
  return res.status(statusCode).json(body);
}

export function sendError(res: Response, statusCode: number, error: ApiFailure['error']) {
  const body: ApiFailure = { success: false, error };
  return res.status(statusCode).json(body);
}
