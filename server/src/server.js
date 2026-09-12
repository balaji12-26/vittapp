import { createApp } from './app.js';
import { connectDb, disconnectDb, assertTransactionSupport } from './config/db.js';
import { env, assertEnv } from './config/env.js';

assertEnv();

const app = createApp();

const connection = await connectDb(env.mongoUri);
console.log(`MongoDB connected: ${connection.name}`);
await assertTransactionSupport();

const server = app.listen(env.port, () => {
  console.log(`EventEase API listening on http://localhost:${env.port}`);
});

async function shutdown(signal) {
  console.log(`\n${signal} received, shutting down.`);
  server.close(async () => {
    await disconnectDb();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
