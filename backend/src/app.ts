import express from 'express';

/**
 * Builds and configures the Express application.
 * It does NOT start listening — that's server.ts's job — so tests can import
 * the app and send requests to it without opening a real port.
 */
export function createApp() {
  const app = express();

  // Parse JSON request bodies into req.body.
  app.use(express.json());

  // Temporary route to prove the server works. Replaced by a proper
  // health-check module in Phase 2.
  app.get('/', (_req, res) => {
    res.json({ success: true, data: { message: 'Movie booking API is running' } });
  });

  return app;
}
