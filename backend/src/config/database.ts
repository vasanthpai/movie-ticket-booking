import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Owns the single MongoDB connection for the whole app.
 *
 * Mongoose keeps one connection *pool* per process and reuses it for every
 * query — we connect once at startup, never per request.
 */

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, {
    // Give up after 5s instead of the default 30s if no server is reachable,
    // so a wrong URI or blocked IP fails quickly at startup.
    serverSelectionTimeoutMS: 5000,
  });
  const { host, name } = mongoose.connection;
  console.info(`✅ MongoDB connected (${host}/${name})`);

  // Log connection changes AFTER the first successful connect — otherwise a
  // failed startup would also print a misleading "disconnected" warning.
  // (Mongoose retries automatically after a dropped connection.)
  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.info('✅ MongoDB reconnected'));
  mongoose.connection.on('error', (error) => console.error('❌ MongoDB error:', error));
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
}
