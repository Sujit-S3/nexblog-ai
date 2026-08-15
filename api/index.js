import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Core routes & legacy routes
import userRoutes from './src/routes/user.route.js';
import authRoutes from './src/routes/auth.route.js';
import postRoutes from './src/routes/post.route.js';
import commentRoutes from './src/routes/comment.route.js';
import aiRoutes from './src/routes/ai.route.js';
import aiMemoryRoutes from './src/routes/aiMemory.route.js';

// Version 3.2.5 Hardened Subsystems & v1 Domain Routers
import { validateEnv } from './src/utils/env.validator.js';
import { securityHeaders, generalLimiter, mongoSanitize } from './src/middlewares/security.middleware.js';
import observabilityMiddleware from './src/middlewares/observability.middleware.js';
import globalErrorHandler from './src/middlewares/errorHandler.middleware.js';
import { mountDocs } from './src/docs/openapi.generator.js';
import { registerKnowledgeWorker } from './src/services/queue/workers/KnowledgeIngestWorker.js';

import aiV1Routes from './src/routes/v1/ai.v1.route.js';
import knowledgeV1Routes from './src/routes/v1/knowledge.v1.route.js';
import workflowsV1Routes from './src/routes/v1/workflows.v1.route.js';
import evaluationV1Routes from './src/routes/v1/evaluation.v1.route.js';
import verificationV1Routes from './src/routes/v1/verification.v1.route.js';
import jobsV1Routes from './src/routes/v1/jobs.v1.route.js';
import healthV1Routes from './src/routes/v1/health.v1.route.js';

// Configure environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// 1. Startup Validation
validateEnv();

const app = express();

// 2. Security Hardening & Observability Middlewares
app.use(securityHeaders);
app.use(observabilityMiddleware);
app.use(generalLimiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://blog.100jsprojects.com',
  'https://mern-blog-client-steel.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'Accept', 'X-Request-Id'],
  })
);

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.log('❌ MongoDB connection error:', err.message);
    isConnected = false;
    throw err;
  }
};

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize);

const connectMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Database connection failed' });
  }
};

// 3. Mount OpenAPI 3.0 Documentation & Swagger UI
mountDocs(app);

// Test & Debug endpoints
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date() });
});

app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug info',
    nodeEnv: process.env.NODE_ENV,
    hasMongoEnv: !!process.env.MONGO,
    hasJwtSecret: !!process.env.JWT_SECRET,
    timestamp: new Date(),
  });
});

app.get('/api/debug-db', async (req, res) => {
  try {
    await connectDB();
    res.json({
      message: 'Database connection successful!',
      connected: true,
      timestamp: new Date(),
    });
  } catch (error) {
    res.json({
      message: 'Database connection failed',
      connected: false,
      error: error.message,
      timestamp: new Date(),
    });
  }
});

// 4. Mount Domain-Driven v1 Routers (Recommended Versioned API)
app.use('/api/v1/ai', connectMiddleware, aiV1Routes);
app.use('/api/v1/knowledge', connectMiddleware, knowledgeV1Routes);
app.use('/api/v1/workflows', connectMiddleware, workflowsV1Routes);
app.use('/api/v1/evaluation', connectMiddleware, evaluationV1Routes);
app.use('/api/v1/verification', connectMiddleware, verificationV1Routes);
app.use('/api/v1/jobs', connectMiddleware, jobsV1Routes);
app.use('/api/v1/health', connectMiddleware, healthV1Routes);
app.use('/api/health', connectMiddleware, healthV1Routes); // Top-level health alias

// 5. Core User & Blog Domain Routes
app.use('/api/user', connectMiddleware, userRoutes);
app.use('/api/auth', connectMiddleware, authRoutes);
app.use('/api/post', connectMiddleware, postRoutes);
app.use('/api/comment', connectMiddleware, commentRoutes);
app.use('/api/ai/memory', connectMiddleware, aiMemoryRoutes);

// 6. Backwards-Compatibility Deprecated Legacy Wrapper for /api/ai
app.use('/api/ai', connectMiddleware, (req, res, next) => {
  res.setHeader('X-API-Deprecated', 'true');
  res.setHeader('X-API-Migration-Guide', '/api/v1/docs');
  next();
}, aiRoutes);

// 7. Standardized Global Error Handler Middleware
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
    registerKnowledgeWorker();
  });
}

// Export for Vercel
export default app;
