import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';

export function signToken(user) {
  return jwt.sign(
    { sub: user.id ?? user._id.toString(), role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function readBearer(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * Verifies the token and loads the user. Loading the user (rather than
 * trusting the claims alone) means a deleted account or a role changed after
 * the token was issued cannot keep acting on the old claims.
 */
export async function requireAuth(req, _res, next) {
  try {
    const token = readBearer(req);
    if (!token) throw ApiError.unauthorized('Sign in to continue.');

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Your session expired. Sign in again.'
          : 'That session is not valid. Sign in again.';
      throw ApiError.unauthorized(message);
    }

    const user = await User.findById(payload.sub);
    if (!user) throw ApiError.unauthorized('That account no longer exists.');

    req.user = user;
    req.userId = user.id;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Role gate. Always used after requireAuth — hiding a button in the UI is not
 * authorization, so every organizer route carries this on the server.
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          roles.includes('organizer')
            ? 'Only organizer accounts can do that.'
            : 'Only attendee accounts can do that.'
        )
      );
    }
    next();
  };
}
