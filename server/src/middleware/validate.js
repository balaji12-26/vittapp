import { ApiError } from '../utils/ApiError.js';

/**
 * Turns a Zod issue list into the `details` shape the client uses to attach
 * messages to individual inputs: [{ field, message }].
 */
function toDetails(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '_',
    message: issue.message,
  }));
}

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(ApiError.validation(toDetails(result.error)));
  }
  // Replace with the parsed value so controllers get trimmed, coerced,
  // stripped data — never raw client input.
  if (source === 'query') {
    req.validatedQuery = result.data;
  } else {
    req[source] = result.data;
  }
  next();
};
