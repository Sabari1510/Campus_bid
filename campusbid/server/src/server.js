import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
// Always load .env from server/ regardless of the CWD where node is invoked
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import connectDB from '../config/db.js';
import { validateEnv } from '../config/env.js';
import app from './app.js';

validateEnv();
connectDB();

const PORT = process.env.PORT || 5000;

// Global crash protection — log and keep running instead of dying
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT_EXCEPTION]', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED_REJECTION]', reason);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});