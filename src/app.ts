import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { logger } from './config/logger';
import { env } from './config/env';
import { errorHandler } from './core/middlewares/error.middleware';
import { payloadDecryptMiddleware } from './core/middlewares/payload-decrypt.middleware';
import { setupSwagger } from './config/swagger';
import v1Router from './modules/v1';
import { AppError } from './core/errors/app.error';

const app = express();

// --- SECURITY & CORS CONFIGURATION ---

// 1. Helmet: Secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Required if we serve images or docs across origins
}));

// 2. CORS: Restrict origins based on environment variables
const allowedOrigins = env.ALLOWED_ORIGINS === '*' ? '*' : env.ALLOWED_ORIGINS.split(',');
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// 3. Rate Limiting: Prevent brute-force and DDoS
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, 
  max: env.RATE_LIMIT_MAX_REQS, 
  message: {
    success: false,
    message: `Too many requests from this IP, please try again later`,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter specifically to API routes
app.use('/api', apiLimiter);

// --- CORE MIDDLEWARES ---
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size to prevent memory exhaustion
app.use(payloadDecryptMiddleware); // E2EE Payload Decryption (must be after express.json)
app.use(pinoHttp({ logger }));

// --- API DOCUMENTATION ---
setupSwagger(app);

// --- ROUTES ---
app.use('/api/v1', v1Router);

// --- FALLBACKS & ERROR HANDLING ---
app.use('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

export default app;
