class ApiError extends Error {
  constructor(status, message, code = 'API_ERROR', details) { super(message); this.status = status; this.code = code; this.details = details; }
}
const validate = (schema, target = 'body') => (req, res, next) => { const result = schema.safeParse(req[target]); if (!result.success) return next(new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', result.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })))); req[target] = result.data; next(); };
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const errorHandler = (err, req, res, next) => { const status = err.status || 500; res.status(status).json({ error: { message: err.message || 'Internal server error', code: err.code || 'INTERNAL_ERROR', ...(err.details ? { details: err.details } : {}) } }); };
module.exports = { ApiError, validate, asyncHandler, errorHandler };
