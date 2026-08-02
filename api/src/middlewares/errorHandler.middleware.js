import { sendError } from '../utils/response.envelope.js';
import { z } from 'zod';

/**
 * Global Error Handler Middleware
 * Intercepts all unhandled exceptions, Zod validation errors, MongoDB duplicate key conflicts,
 * and AI provider failures, transforming them into standardized error envelopes.
 */
export function globalErrorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred.';
  let details = {};

  // 1. Handle Zod Schema Validation Errors
  if (err instanceof z.ZodError || err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed.';
    details = {
      issues: err.issues ? err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })) : [],
    };
  }

  // 2. Handle MongoDB Duplicate Key Errors (Code 11000)
  if (err.code === 11000 || typeof err.code === 'number' && err.code === 11000) {
    statusCode = 400;
    code = 'DUPLICATE_RESOURCE_ERROR';
    const key = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${key.charAt(0).toUpperCase() + key.slice(1)} is already registered or in use.`;
    details = { field: key, value: err.keyValue?.[key] };
  }

  // 3. Handle Mongoose Cast Errors (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_IDENTIFIER_ERROR';
    message = `Invalid ${err.path}: ${err.value}.`;
  }

  // 4. Handle JWT & Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'AUTHENTICATION_ERROR';
    message = 'Invalid authentication token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED_ERROR';
    message = 'Authentication token expired. Please log in again.';
  }

  // 5. Handle AI Provider Timeouts & Rate Limits
  if (message.toLowerCase().includes('timeout') || message.toLowerCase().includes('timed out')) {
    statusCode = 504;
    code = 'AI_PROVIDER_TIMEOUT';
    message = 'The AI generation request timed out. Please try again.';
  }
  if (message.toLowerCase().includes('rate limit') || statusCode === 429) {
    statusCode = 429;
    code = 'RATE_LIMIT_EXCEEDED';
  }

  // Ensure statusCode is numeric and valid
  if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
    statusCode = 500;
  }

  return sendError(res, code, message, details, statusCode);
}

export default globalErrorHandler;
