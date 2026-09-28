import type { Request, Response } from 'express';
import { isDatabaseConnected } from '../../config/database.js';
import { sendError, sendSuccess } from '../../utils/api-response.js';

/**
 * GET /api/health
 *
 * Used by humans, uptime monitors and hosting platforms (Render/Railway) to
 * decide whether this instance can serve traffic. Returns 503 when the database
 * is down, so a load balancer can stop sending requests here.
 *
 * No service layer: there is no business logic, just a status report.
 */
export function getHealth(_req: Request, res: Response) {
  const report = {
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  if (report.database !== 'connected') {
    // Keep the API contract: a non-2xx status always has success: false.
    return sendError(res, 503, {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Database is not connected',
      details: report,
    });
  }

  return sendSuccess(res, { status: 'ok', ...report });
}
