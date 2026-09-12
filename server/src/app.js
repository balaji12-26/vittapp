import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { env } from './config/env.js';

export function createApp() {
  const app = express();

  // Behind a proxy in production the rate limiter needs the real client IP.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    cors({
      origin: env.clientOrigin === '*' ? true : env.clientOrigin.split(',').map((o) => o.trim()),
      credentials: false,
    })
  );
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', apiLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
