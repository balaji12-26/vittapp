/**
 * Express 4 does not catch rejections from async route handlers, so every
 * controller is wrapped and forwards to the error middleware instead of
 * hanging the request.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
