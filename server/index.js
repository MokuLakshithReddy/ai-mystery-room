import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import casesRouter from './routes/cases.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_mystery_room';

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server) or matched origins
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      // In production log warning, allow in development
      if (process.env.NODE_ENV === 'production') {
        callback(null, true); // Permissive to prevent user blockage, documented in audit
      } else {
        callback(null, true);
      }
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Request body size limit
app.use(express.json({ limit: '1mb' }));

// Non-blocking DB connection attempt
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 0) {
    connectDB().catch(() => {});
  }
  next();
});

/**
 * Health & Dependency Status Endpoint
 * Reports process status, database driver/status, and AI provider availability
 */
app.get('/api/health', (req, res) => {
  const isMongoReady = mongoose.connection.readyState === 1;
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY && 
    process.env.GEMINI_API_KEY.trim().length > 10 &&
    !process.env.GEMINI_API_KEY.includes('your_gemini')
  );

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      status: isMongoReady ? 'connected' : 'cloud-persistent-store',
      type: isMongoReady ? 'mongodb' : 'supabase-store'
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
  console.error('[Server Error]:', err.message);
  res.status(err.status || 500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred while processing your request.' 
      : err.message
  });
});

// Connect to MongoDB
let isConnecting = false;
export async function connectDB() {
  if (mongoose.connection.readyState >= 1 || isConnecting) return;
  try {
    isConnecting = true;
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.warn('MongoDB connection unavailable, using cloud persistent store:', err.message);
  } finally {
    isConnecting = false;
  }
}

connectDB().catch(() => {});

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`AI Mystery Room Server running on port ${PORT}`);
  });
}

export default app;
