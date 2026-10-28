import express from 'express';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { requestLogger } from './utils/logger.js';

const app = express();

app.use(requestLogger);
app.use(express.json({ limit: '10kb' }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Simple test route
app.get('/api/test', (req, res) => res.json({ message: 'API working' }));

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

export default app;