import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * Helmet Security Middleware Configuration
 * Sets strict HTTP headers including CSP, HSTS, frame options, and MIME nosniffing.
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://api.openai.com', 'https://generativelanguage.googleapis.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * General API Rate Limiter
 * Protects standard endpoints against DDoS and brute-force queries.
 * Limits: 150 requests per 15 minutes per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP. Please try again in 15 minutes.',
    },
  },
});

/**
 * High-Cost AI Generation Rate Limiter
 * Protects expensive token-generation routes (/api/ai/*, /api/v1/ai/*).
 * Limits: 30 requests per 5 minutes per IP.
 */
export const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'AI generation request limit reached. Please wait before running more generation tasks.',
    },
  },
});

/**
 * OWASP NoSQL Injection Sanitizer Middleware
 * Recursively cleans incoming request body and query keys to strip '$' and '.' characters.
 */
export function mongoSanitize(req, res, next) {
  if (req.body) {
    req.body = _cleanObject(req.body);
  }
  if (req.query) {
    req.query = _cleanObject(req.query);
  }
  next();
}

function _cleanObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(_cleanObject);
  }
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    const safeKey = key.replace(/^\$|\./g, '_');
    cleaned[safeKey] = _cleanObject(value);
  }
  return cleaned;
}
