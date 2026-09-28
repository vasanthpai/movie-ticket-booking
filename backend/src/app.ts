import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiRouter } from './routes.js';
import { notFound } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

/**
 * Builds and configures the Express application.
 * It does NOT start listening — that's server.ts's job — so tests can import
 * the app and send requests to it without opening a real port.
 *
 * ORDER MATTERS: middleware runs top to bottom for every request.
 */
export function createApp() {
  const app = express();

  // 1. Security headers (e.g. X-Content-Type-Options, removes X-Powered-By).
  app.use(helmet());

  // 2. Allow the frontend (a different origin) to call this API from the browser.
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  // 3. Log each request: method, URL, status, response time. Silent in tests.
  //    Must come BEFORE the body parser, or requests with a broken body
  //    (rejected by express.json) would never be logged.
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // 4. Parse JSON bodies into req.body. The size limit blocks huge payloads.
  app.use(express.json({ limit: '100kb' }));

  // 5. All API routes live under /api.
  app.use('/api', apiRouter);

  // 6. Nothing matched → 404. 7. Any error → one consistent JSON response.
  //    These must be registered LAST.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
