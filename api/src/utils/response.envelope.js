/**
 * Standardized Response Envelopes
 * Ensures all API endpoints across the OS return consistent, predictable JSON structures.
 */

/**
 * Send a standardized success envelope.
 * @param {import('express').Response} res
 * @param {any} data - The payload to return
 * @param {Object} [meta={}] - Pagination, timestamps, version, or RAG statistics
 * @param {number} [statusCode=200]
 */
export function sendSuccess(res, data, meta = {}, statusCode = 200) {
  const requestId = res.req?.requestId || res.getHeader('X-Request-Id') || 'unknown';
  
  return res.status(statusCode).json({
    success: true,
    requestId,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
      ...meta,
    },
  });
}

/**
 * Send a standardized error envelope.
 * @param {import('express').Response} res
 * @param {string} code - Machine-readable error code (e.g., 'AI_PROVIDER_TIMEOUT')
 * @param {string} message - Human-readable error message
 * @param {Object} [details={}] - Granular validation or diagnostic details
 * @param {number} [statusCode=500]
 */
export function sendError(res, code, message, details = {}, statusCode = 500) {
  const requestId = res.req?.requestId || res.getHeader('X-Request-Id') || 'unknown';

  return res.status(statusCode).json({
    success: false,
    requestId,
    error: {
      code: code || 'INTERNAL_SERVER_ERROR',
      message: message || 'An unexpected error occurred.',
      details: details || {},
    },
  });
}

export default {
  sendSuccess,
  sendError,
};
