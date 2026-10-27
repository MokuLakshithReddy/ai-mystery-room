import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';
import casesRouter from './routes/cases.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_mystery_room';

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Authoritative CORS Configuration
const DEFAULT_ALLOWED_ORIGINS = [
  'https://client-tau-sable-95.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

const DEV_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

const EXTRA_ALLOWED = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const isProduction = process.env.NODE_ENV === 'production';

export function isOriginAllowed(origin) {
  // Allow non-browser requests (curl, server-to-server, unit/integration test agents)
  if (!origin) return true;

  if (DEFAULT_ALLOWED_ORIGINS.includes(origin)) return true;
  if (EXTRA_ALLOWED.includes(origin)) return true;

  // In development and testing, permit local host addresses
  if (!isProduction && DEV_ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS_ORIGIN_NOT_ALLOWED: Request from unauthorized origin blocked by CORS policy.'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Global API Rate Limiter (skip in test environment)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300, // 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: 'Too many requests, please try again after a minute.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use('/api', apiLimiter);

// Request body size limit
app.use(express.json({ limit: '1mb' }));

// Database Connection Readiness Middleware
// Enforces database connection check before passing traffic to case routes
app.use('/api/cases', async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  const isMongoReady = mongoose.connection.readyState === 1;
  const isSupabaseConfigured = Boolean(
    process.env.SUPABASE_URL && 
    process.env.SUPABASE_KEY && 
    process.env.SUPABASE_URL.startsWith('http')
  );
  const allowInMemory = process.env.ALLOW_IN_MEMORY_FOR_TESTS === 'true' || process.env.NODE_ENV === 'test';

  if (!isMongoReady && !isSupabaseConfigured && !allowInMemory) {
    return res.status(503).json({
      error: 'Service Unavailable: No durable persistence store is connected or configured.',
      code: 'DURABLE_STORE_UNAVAILABLE'
    });
  }

  next();
});

/**
 * Health & Dependency Status Endpoint
 * Verifies actual dependency connectivity and database reachability before reporting healthy
 */
app.get('/api/health', async (req, res) => {
  let isMongoReady = false;
  let mongoPingError = null;

  // 1. Actively ping MongoDB if connected
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    try {
      await mongoose.connection.db.admin().ping();
      isMongoReady = true;
    } catch (err) {
      mongoPingError = err.message;
      isMongoReady = false;
    }
  }

  // 2. Check if Supabase Cloud Store is configured
  const isSupabaseConfigured = Boolean(
    process.env.SUPABASE_URL && 
    process.env.SUPABASE_KEY && 
    process.env.SUPABASE_URL.startsWith('http')
  );

  let isSupabaseReady = false;
  if (!isMongoReady && isSupabaseConfigured) {
    try {
      const pingRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/ai_mystery_cases?limit=1&select=id`, {
        headers: {
          'apikey': process.env.SUPABASE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
        }
      });
      isSupabaseReady = pingRes.ok;
    } catch (err) {
      isSupabaseReady = false;
    }
  }

  const hasDurableStore = isMongoReady || isSupabaseReady;
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY.trim().length > 10 &&
    !process.env.GEMINI_API_KEY.includes('your_gemini')
  );

  const status = hasDurableStore ? 'ok' : 'unhealthy';
  const httpCode = hasDurableStore ? 200 : 503;

  res.status(httpCode).json({
    status,
    healthy: hasDurableStore,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      connected: hasDurableStore,
      status: isMongoReady ? 'connected' : (isSupabaseReady ? 'cloud-store-connected' : 'unreachable'),
      type: isMongoReady ? 'mongodb' : (isSupabaseConfigured ? 'supabase-store' : 'none'),
      ping: isMongoReady ? 'pong' : (isSupabaseReady ? 'ok' : (mongoPingError || 'failed'))
    },
    ai: {
      provider: 'google-gemini',
      model: 'gemini-2.5-flash',
      configured: hasGeminiKey,
      fallbackCertified: true
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/cases', casesRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS_ORIGIN_NOT_ALLOWED')) {
    return res.status(403).json({
      error: 'Access denied: origin not allowed by CORS policy',
      code: 'CORS_FORBIDDEN'
    });
  }

  console.error('[Server Error]:', err.message);
  res.status(err.status || 500).json({ 
    error: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// Connect to MongoDB with shared connection promise
let dbConnectionPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (dbConnectionPromise) {
    return await dbConnectionPromise;
  }

  dbConnectionPromise = (async () => {
    try {
      console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 3000
      });
      console.log('MongoDB connected successfully');
      return true;
    } catch (err) {
      console.warn('MongoDB connection unavailable, using fallback store:', err.message);
      return false;
    } finally {
      dbConnectionPromise = null;
    }
  })();

  return await dbConnectionPromise;
}

connectDB().catch(() => {});

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`AI Mystery Room Server running on port ${PORT}`);
  });
}

export default app;
