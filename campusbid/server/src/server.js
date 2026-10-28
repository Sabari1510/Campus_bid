import '../config/db.js';
import '../config/env.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import setupApp from './app.js';

const app = express();
setupApp(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };