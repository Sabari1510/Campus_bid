import './config/db.js';
import './config/env.js';
import express from 'express';
import config from 'dotenv';
config.config();
import setupApp from './app.js';
import { startScheduler } from './jobs/closeScheduler.js';

const app = express();
setupApp(app);

const PORT = process.env.PORT || 5000;

let server;
startScheduler();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };