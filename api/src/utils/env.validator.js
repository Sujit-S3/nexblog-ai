import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'testing', 'staging', 'production', 'test'])
    .default('development'),
  PORT: z.union([z.string(), z.number()]).default(3000),
  MONGO: z.string().min(1, '❌ MONGO environment variable is required for MongoDB connection'),
  JWT_SECRET: z.string().min(8, '❌ JWT_SECRET must be at least 8 characters long for secure authentication'),
  
  // Optional AI Provider keys (warnings generated if none are present)
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Optional Redis & Queue URLs
  REDIS_URL: z.string().optional(),
  DEPLOYMENT_PROFILE: z.string().optional(),
});

/**
 * Validate environment secrets on application startup.
 * Throws a formatted ZodError or exits cleanly if critical variables are missing.
 */
export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    
    // Check if at least one AI provider key is configured
    const hasAIKey = parsed.GEMINI_API_KEY || parsed.OPENAI_API_KEY || parsed.ANTHROPIC_API_KEY;
    if (!hasAIKey && parsed.NODE_ENV !== 'test' && parsed.NODE_ENV !== 'testing') {
      console.warn('⚠️ [EnvValidator] Warning: No AI provider keys (GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY) found. AI endpoints will fail or fall back to mock mode.');
    } else if (hasAIKey) {
      console.log('✅ [EnvValidator] AI provider configuration verified.');
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ [EnvValidator] Fatal Environment Validation Errors:');
      error.errors.forEach((err) => {
        console.error(`   - ${err.path.join('.')}: ${err.message}`);
      });
      if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
        process.exit(1);
      }
    }
    throw error;
  }
}

export default validateEnv;
