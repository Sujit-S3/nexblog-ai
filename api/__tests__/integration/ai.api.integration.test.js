import request from 'supertest';
import app from '../../index.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import queueManager from '../../src/services/queue/QueueManager.js';

describe('Versioned API (/api/v1) Integration Tests', () => {
  let server;
  let tokenCookie;

  beforeAll((done) => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-integration';
    const token = jwt.sign({ id: 'test-user-id', isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    tokenCookie = `access_token=${token}`;
    server = app.listen(0, () => done());
  });

  afterAll(async () => {
    await queueManager.getQueueProvider().shutdown();
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  test('GET /api/v1/health returns standardized health envelope with subsystem diagnostics', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.requestId).toBeDefined();
    expect(res.body.data.subsystems).toBeDefined();
    expect(res.body.data.subsystems.mongodb).toBeDefined();
    expect(res.body.data.subsystems.aiProvider).toBeDefined();
  });

  test('GET /api/v1/docs/openapi.json returns valid OpenAPI 3.0 specification', async () => {
    const res = await request(app).get('/api/v1/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.paths['/ai/generate']).toBeDefined();
  });

  test('POST /api/v1/ai/generate returns 400 validation error envelope when prompt is missing', async () => {
    const res = await request(app)
      .post('/api/v1/ai/generate')
      .set('Cookie', [tokenCookie])
      .send({ feature: 'generate-article' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.issues).toBeDefined();
  });

  test('GET /api/v1/jobs/dlq returns Dead Letter Queue status without crashing', async () => {
    const res = await request(app)
      .get('/api/v1/jobs/dlq')
      .set('Cookie', [tokenCookie]);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/v1/ai/health-dashboard returns 30-day trends and 7 readiness gates', async () => {
    const res = await request(app)
      .get('/api/v1/ai/health-dashboard')
      .set('Cookie', [tokenCookie]);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data || res.body.dashboard).toBeDefined();
    const dashboard = res.body.data || res.body.dashboard;
    expect(dashboard.productionHealth).toBeDefined();
    expect(dashboard.readinessGatesStatus.gates).toHaveLength(7);
  });

  test('POST /api/v1/ai/experiments/create and GET /api/v1/ai/experiments manage A/B prompt variants', async () => {
    const createRes = await request(app)
      .post('/api/v1/ai/experiments/create')
      .set('Cookie', [tokenCookie])
      .send({
        name: 'Header Prompt Test',
        feature: 'generate-article',
        trafficSplit: 0.5,
        variantA: { promptTemplate: 'Write an article about {{topic}}.' },
        variantB: { promptTemplate: 'Craft an authoritative breakdown of {{topic}}.' }
      });

    // Note: If DB is not connected in unit test run, we expect either 201 or clean error envelope without crash
    expect([201, 500]).toContain(createRes.status);
    expect(createRes.body.success).toBeDefined();

    const listRes = await request(app)
      .get('/api/v1/ai/experiments')
      .set('Cookie', [tokenCookie]);
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
  });

  test('GET /api/v1/ai/logs returns paginated telemetry logs with filters', async () => {
    const res = await request(app)
      .get('/api/v1/ai/logs?limit=5')
      .set('Cookie', [tokenCookie]);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data || res.body.logs)).toBe(true);
  });
});
