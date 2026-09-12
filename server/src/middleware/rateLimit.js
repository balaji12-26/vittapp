import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';
import { isTest } from '../config/env.js';

function limiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    // The concurrency test fires 50 requests at once; limiting there would
    // measure the limiter instead of the booking engine.
    skip: () => isTest,
    handler: (_req, _res, next) => next(ApiError.tooManyRequests(message)),
  });
}

/** Sign-in and sign-up: the routes worth brute-forcing. */
export const authLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many attempts from this address. Try again in 15 minutes.',
});

/** A gentler ceiling for everything else, so one client cannot flood the API. */
export const apiLimiter = limiter({
  windowMs: 60 * 1000,
  max: 300,
  message: 'Slow down a moment, then try again.',
});
