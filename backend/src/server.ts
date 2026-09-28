import { env } from './config/env.js';
import { createApp } from './app.js';

/**
 * Entry point: validates config (on import of env), builds the app, starts listening.
 * In Phase 2 this is where we'll connect to MongoDB before accepting requests.
 */
const app = createApp();

// Express 5 calls this callback on success AND on failure (with the error),
// so we must check for the error before announcing success.
app.listen(env.PORT, (error?: NodeJS.ErrnoException) => {
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
