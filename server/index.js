import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import casesRouter from './routes/cases.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_mystery_room';

// CORS Configuration to allow local Vite dev server and deployed frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or if in allowed list
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev to avoid CORS friction
    }
  },
  credentials: true
}));

app.use(express.json());

// Non-blocking DB connection attempt
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 0) {
    connectDB().catch(() => {});
  }
  next();
});

// Healthcheck route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'in-memory-fallback'
  });
});

// API Routes
app.use('/api/cases', casesRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Connect to MongoDB
let isConnecting = false;
export async function connectDB() {
  if (mongoose.connection.readyState >= 1 || isConnecting) return;
  try {
    isConnecting = true;
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 1500
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.warn('MongoDB not reachable, operating with resilient in-memory store:', err.message);
  } finally {
    isConnecting = false;
  }
}

connectDB().catch(() => {});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`AI Mystery Room Server running on port ${PORT}`);
  });
}

export default app;


