// Centralised error handler. Routes can `next(err)` or throw in async wrappers.
// An error may carry a `.status` to control the HTTP code.

// Wrap async route handlers so thrown errors reach this middleware.
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

function errorHandler(err, req, res, _next) {
    const status = err.status || 500;
    if (status >= 500) console.error('Server error:', err);
    res.status(status).json({ error: err.message || 'Internal server error' });
}

// Helper to create errors with an HTTP status attached.
function httpError(status, message) {
    const e = new Error(message);
    e.status = status;
    return e;
}

module.exports = { asyncHandler, errorHandler, httpError };
