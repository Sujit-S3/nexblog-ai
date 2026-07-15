/**
 * OpenAPI 3.0 Specification Generator
 * Auto-generates exact API documentation and serves interactive Swagger docs at /api/v1/docs.
 */
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'AI Knowledge & Content Operating System API',
    version: '3.2.5',
    description: 'Enterprise REST API for Technical Teams, featuring Hexagonal AI Ports, Hybrid RAG, Background Queue workers, and standardized response envelopes.',
    contact: {
      name: 'NexBlog Engineering Team',
      url: 'https://nexblog.ai',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Primary Versioned API Endpoint',
    },
    {
      url: '/api',
      description: 'Backwards-Compatibility Legacy Proxy Endpoint (Deprecated)',
    },
  ],
  paths: {
    '/ai/generate': {
      post: {
        summary: 'Generate technical articles or content using Hexagonal AI adapters',
        tags: ['AI Engine'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string', example: 'Write an architectural breakdown of Hexagonal Ports & Adapters.' },
                  feature: { type: 'string', example: 'generate-article' },
                  provider: { type: 'string', example: 'gemini' },
                  variables: {
                    type: 'object',
                    properties: {
                      useRag: { type: 'boolean', example: true },
                      documentId: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Successful standardized response envelope containing generated text and token telemetry.' },
          '400': { description: 'Zod schema validation error.' },
          '429': { description: 'Rate limit exceeded.' },
          '500': { description: 'Internal server error.' },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Comprehensive system health probe across DB, Queue, Vector Store, and AI Providers',
        tags: ['System Diagnostics'],
        responses: {
          '200': { description: 'System status summary' },
        },
      },
    },
    '/jobs/{jobId}': {
      get: {
        summary: 'Inspect exact progress and status of background queue jobs',
        tags: ['Background Jobs'],
        parameters: [
          { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Job status object' },
          '404': { description: 'Job ID not found' },
        },
      },
    },
  },
};

/**
 * Mount Swagger UI and raw JSON spec endpoints on the express application.
 */
export async function mountDocs(app) {
  app.get('/api/v1/docs/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiSpec);
  });

  try {
    const swaggerUi = await import('swagger-ui-express');
    app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
    console.log('✅ [OpenAPI] Interactive Swagger UI mounted at: /api/v1/docs');
  } catch (err) {
    // If swagger-ui-express not installed yet, serve clean HTML fallback renderer
    app.get('/api/v1/docs', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>AI Operating System API Documentation</title>
          <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
          <script>
            window.onload = () => {
              window.ui = SwaggerUIBundle({
                url: '/api/v1/docs/openapi.json',
                dom_id: '#swagger-ui',
              });
            };
          </script>
        </body>
        </html>
      `);
    });
    console.log('✅ [OpenAPI] HTML Swagger Viewer mounted at: /api/v1/docs (using CDN)');
  }
}

export default {
  openApiSpec,
  mountDocs,
};
