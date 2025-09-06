import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Auth
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // SMTP (optional for development)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Parse and validate environment variables
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env)
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      console.error(error.flatten().fieldErrors)
      
      // Only throw in production, warn in development
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment variables')
      } else {
        console.warn('⚠️  Running with invalid environment variables in development mode')
        // Return a partial env object for development
        return {
          DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
          AUTH_SECRET: process.env.AUTH_SECRET || 'development-secret-change-in-production',
          NODE_ENV: 'development' as const,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL,
          SMTP_HOST: process.env.SMTP_HOST,
          SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
          SMTP_USER: process.env.SMTP_USER,
          SMTP_PASS: process.env.SMTP_PASS,
          SMTP_FROM: process.env.SMTP_FROM,
        }
      }
    }
    throw error
  }
}

export const env = validateEnv()

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>