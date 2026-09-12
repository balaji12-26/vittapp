import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];

function read(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

export const env = {
  nodeEnv: read('NODE_ENV', 'development'),
  port: Number(read('PORT', 5000)),
  mongoUri: read('MONGO_URI'),
  jwtSecret: read('JWT_SECRET'),
  jwtExpiresIn: read('JWT_EXPIRES_IN', '7d'),
  clientOrigin: read('CLIENT_ORIGIN', 'http://localhost:5173'),
  bcryptRounds: Number(read('BCRYPT_ROUNDS', 12)),
};

export const isTest = env.nodeEnv === 'test';

/**
 * Called from server.js only. Tests and scripts supply their own URI, so they
 * skip this and never trip over a missing .env.
 */
export function assertEnv() {
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(
      `Missing environment variables: ${missing.join(', ')}.\n` +
        'Copy .env.example to .env and fill them in.'
    );
    process.exit(1);
  }
  if (env.jwtSecret && env.jwtSecret.length < 24) {
    console.error('JWT_SECRET is too short. Use at least 24 characters.');
    process.exit(1);
  }
}
