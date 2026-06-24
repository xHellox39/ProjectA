"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.error(`[ERROR] ${statusCode} - ${message}`);
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
}
function notFoundHandler(_req, res, _next) {
    const err = new Error(`Route ${_req.method} ${_req.originalUrl} not found`);
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
}
