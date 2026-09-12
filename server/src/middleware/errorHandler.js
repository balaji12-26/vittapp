import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFound(req, _res, next) {
  next(ApiError.notFound(`No route for ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let apiError = err;

  if (!(apiError instanceof ApiError)) {
    if (err instanceof mongoose.Error.CastError) {
      apiError = ApiError.badRequest(`"${err.value}" is not a valid id.`);
    } else if (err instanceof mongoose.Error.ValidationError) {
      apiError = ApiError.validation(
        Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }))
      );
    } else if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern ?? {})[0] ?? 'value';
      apiError = ApiError.conflict(
        'DUPLICATE',
        field === 'email'
          ? 'An account with that email already exists. Sign in instead.'
          : `That ${field} is already taken.`,
        [{ field, message: 'Already in use' }]
      );
    } else if (err?.type === 'entity.parse.failed') {
      apiError = ApiError.badRequest('The request body is not valid JSON.');
    } else {
      apiError = new ApiError(500, 'INTERNAL', 'Something went wrong on our side.');
    }
  }

  if (apiError.status >= 500) {
    console.error(err);
  }

  const body = apiError.toJSON();
  if (env.nodeEnv === 'development' && apiError.status >= 500) {
    body.error.stack = err.stack;
  }

  res.status(apiError.status).json(body);
}
