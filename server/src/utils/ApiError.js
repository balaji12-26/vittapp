/**
 * Every failure leaves the API as { error: { code, message, details } }.
 * `code` is a stable machine string the client can branch on; `message` is
 * written for a person to read; `details` carries per-field or per-category
 * specifics (or null).
 */
export class ApiError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return { error: { code: this.code, message: this.message, details: this.details } };
  }

  static badRequest(message, details = null) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static validation(details) {
    return new ApiError(422, 'VALIDATION_FAILED', 'Some fields need fixing.', details);
  }

  static unauthorized(message = 'Sign in to continue.') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = "You don't have access to this.") {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = "We couldn't find that.") {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(code, message, details = null) {
    return new ApiError(409, code, message, details);
  }

  static tooManyRequests(message = 'Too many attempts. Try again in a minute.') {
    return new ApiError(429, 'RATE_LIMITED', message);
  }
}
