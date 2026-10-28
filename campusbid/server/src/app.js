import express from 'express';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import logger from '../utils/logger.js';

const app = express();

app.use(logger);
app.use(express.json({ limit: '10kb' }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(mongoSanitize());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Mount routes
import authRoutes from '../routes/auth.routes.js';
import auctionRoutes from '../routes/auction.routes.js';
import bidRoutes from '../routes/bid.routes.js';
import questionRoutes from '../routes/question.routes.js';
import wantedRoutes from '../routes/wanted.routes.js';
import notificationRoutes from '../routes/notification.routes.js';
import aiRoutes from '../routes/ai.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/wanted', wantedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Unknown route
app.use('*', (req, res) => res.status(404).json({ message: 'Not found' }));

export default app;