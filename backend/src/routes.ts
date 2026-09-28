import { Router } from 'express';
import { healthRouter } from './modules/health/health.routes.js';

/**
 * Mounts every module's router under /api (see app.ts).
 * Each new module adds one line here — this file is the API's table of contents.
 */
export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
