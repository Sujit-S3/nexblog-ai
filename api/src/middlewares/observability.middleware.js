import crypto from 'crypto';
import observabilityService from '../services/observability/ObservabilityService.js';

/**
 * Observability Middleware
 * Injects UUIDv4 requestId, initiates request tracing spans, and logs completion metrics and latency.
 */
export function observabilityMiddleware(req, res, next) {
  // 1. Resolve or generate unique request ID
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  // 2. Start trace span
  const span = observabilityService.startTrace(requestId, `${req.method} ${req.originalUrl || req.url}`);
  req.traceSpan = span;

  // 3. Track active HTTP request metrics
  observabilityService.incrementCounter('http_requests_total', 1, { method: req.method, route: req.path });

  // 4. Hook into HTTP response completion
  res.on('finish', () => {
    observabilityService.endTrace(span, { status: res.statusCode });
    const latencyMs = span.durationMs || (Date.now() - span.startTime);

    observabilityService.recordHistogram('http_request_duration_ms', latencyMs, {
      method: req.method,
      status: res.statusCode,
    });

    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    observabilityService.log(level, `HTTP ${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} (${latencyMs}ms)`, {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      latencyMs,
    });
  });

  next();
}

export default observabilityMiddleware;
