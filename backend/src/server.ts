import type { Server } from 'node:http';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { createApp } from './app.js';

/**
 * Entry point. Startup order matters:
 *   1. validate config (happens when env.ts is imported)
 *   2. connect to MongoDB — if this fails, exit; don't serve broken requests
 *   3. start listening for HTTP
 */
async function start() {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('❌ Could not connect to MongoDB:', (error as Error).message);
    console.error('   Check MONGODB_URI in .env and (for Atlas) your IP access list.');
    process.exit(1);
  }

  const app = createApp();

  // Express 5 calls this callback on success AND on failure (with the error),
  // so we must check for the error before announcing success.
  const server = app.listen(env.PORT, (error?: NodeJS.ErrnoException) => {
    if (error) {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${env.PORT} is already in use. Change PORT in .env.`);
      } else {
        console.error('❌ Server failed to start:', error);
      }
      process.exit(1);
    }

    console.info(`🚀 API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  registerShutdownHandlers(server);
}

/**
 * Graceful shutdown: on Ctrl+C (SIGINT) or a platform stop signal (SIGTERM),
 * stop accepting new requests, let in-flight ones finish, then close the DB.
 * Without this, a deploy could cut off a request halfway through (e.g. mid-booking).
 */
function registerShutdownHandlers(server: Server) {
  let shuttingDown = false;

  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.info(`\n${signal} received — shutting down gracefully...`);

    // Safety net: if something hangs, force-exit after 10s.
    setTimeout(() => {
      console.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();

    server.close(async () => {
      await disconnectDatabase();
      console.info('👋 Shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

void start();
