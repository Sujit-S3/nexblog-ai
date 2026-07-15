import crypto from 'crypto';
import AiLog from '../../models/aiLog.model.js';

/**
 * ObservabilityService
 * Separates Telemetry into distinct pillars: Metrics, Logs, Traces, Health, and Alerts.
 */
class ObservabilityService {
  constructor() {
    this.metrics = {
      counters: new Map(),
      histograms: new Map(), // name -> array of numbers
      gauges: new Map(),
    };
    this.traces = new Map(); // traceId -> Array of spans
    this.alerts = [];
    this.eventLoopLagMs = 0;
    this._startEventLoopMonitor();
  }

  _startEventLoopMonitor() {
    setInterval(() => {
      const start = Date.now();
      setImmediate(() => {
        this.eventLoopLagMs = Date.now() - start;
        this.setGauge('event_loop_lag_ms', this.eventLoopLagMs);
      });
    }, 2000).unref();
  }

  // --- PILLAR 1: METRICS ---
  incrementCounter(name, value = 1, tags = {}) {
    const key = `${name}_${JSON.stringify(tags)}`;
    const current = this.metrics.counters.get(key) || 0;
    this.metrics.counters.set(key, current + value);
  }

  recordHistogram(name, value, tags = {}) {
    const key = `${name}_${JSON.stringify(tags)}`;
    if (!this.metrics.histograms.has(key)) {
      this.metrics.histograms.set(key, []);
    }
    const arr = this.metrics.histograms.get(key);
    arr.push(value);
    if (arr.length > 1000) arr.shift(); // Keep last 1000 data points in memory
  }

  setGauge(name, value, tags = {}) {
    const key = `${name}_${JSON.stringify(tags)}`;
    this.metrics.gauges.set(key, value);
  }

  getMetricsSummary() {
    const summary = {
      counters: Object.fromEntries(this.metrics.counters),
      gauges: Object.fromEntries(this.metrics.gauges),
      histograms: {},
    };

    for (const [key, values] of this.metrics.histograms.entries()) {
      if (values.length === 0) continue;
      const sorted = [...values].sort((a, b) => a - b);
      const sum = sorted.reduce((a, b) => a + b, 0);
      summary.histograms[key] = {
        count: sorted.length,
        avg: Math.round(sum / sorted.length),
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      };
    }
    return summary;
  }

  // --- PILLAR 2: LOGS ---
  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const formatted = {
      timestamp,
      level: level.toUpperCase(),
      message,
      requestId: meta.requestId || 'system',
      ...meta,
    };

    if (level === 'error' || level === 'fatal') {
      console.error(`❌ [${formatted.level}] [${formatted.requestId}] ${message}`, meta);
    } else if (level === 'warn') {
      console.warn(`⚠️ [${formatted.level}] [${formatted.requestId}] ${message}`, meta);
    } else if (level === 'debug') {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`🔍 [${formatted.level}] [${formatted.requestId}] ${message}`, meta);
      }
    } else {
      console.log(`ℹ️ [${formatted.level}] [${formatted.requestId}] ${message}`);
    }
  }

  // --- PILLAR 3: TRACES ---
  startTrace(requestId = crypto.randomUUID(), name = 'HTTP_Request') {
    const spanId = crypto.randomUUID();
    const startTime = Date.now();
    const span = {
      spanId,
      requestId,
      name,
      startTime,
      endTime: null,
      durationMs: null,
      tags: {},
    };

    if (!this.traces.has(requestId)) {
      this.traces.set(requestId, []);
    }
    this.traces.get(requestId).push(span);
    return span;
  }

  endTrace(span, tags = {}) {
    if (!span) return;
    span.endTime = Date.now();
    span.durationMs = span.endTime - span.startTime;
    span.tags = { ...span.tags, ...tags };

    this.recordHistogram('trace_duration_ms', span.durationMs, { name: span.name });
  }

  getTraces(requestId) {
    return this.traces.get(requestId) || [];
  }

  // --- PILLAR 4: HEALTH ---
  async checkHealth() {
    const metrics = this.getMetricsSummary();
    const memoryUsage = process.memoryUsage();
    return {
      status: this.eventLoopLagMs > 200 ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      eventLoopLagMs: this.eventLoopLagMs,
      memoryUsageMb: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
      metricsSummary: metrics,
      activeAlerts: this.alerts.length,
    };
  }

  // --- PILLAR 5: ALERTS ---
  triggerAlert(severity, title, details = {}) {
    const alert = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      severity,
      title,
      details,
      acknowledged: false,
    };
    this.alerts.unshift(alert);
    if (this.alerts.length > 100) this.alerts.pop();

    this.log('warn', `🚨 ALERT TRIGGERED [${severity.toUpperCase()}]: ${title}`, details);
    return alert;
  }

  getAlerts(activeOnly = true) {
    if (activeOnly) {
      return this.alerts.filter((a) => !a.acknowledged);
    }
    return this.alerts;
  }
}

export const observabilityService = new ObservabilityService();
export default observabilityService;
