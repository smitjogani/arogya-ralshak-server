import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import { errorHandler } from './core/middlewares/error.middleware';
import v1Router from './modules/v1';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.use('/api/v1', v1Router);

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;
