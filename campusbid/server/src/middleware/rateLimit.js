import rateLimit from 'express-rate-limit';

export const qaRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many questions, please try again later.',
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'AI requests exceeded, please try again later.',
});