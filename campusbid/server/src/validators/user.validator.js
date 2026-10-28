import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const otpVerifySchema = z.object({
  code: z.string().length(6, 'OTP must be 6 digits'),
});

export const createListingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  condition: z.enum(['new', 'like-new', 'used', 'damaged']).optional(),
  startPrice: z.number().int().min(0, 'Start price must be positive'),
  minIncrement: z.number().int().min(1).default(10),
  closesAt: z.string().datetime('Invalid close time'),
  photos: z.array(z.string()).max(3, 'Maximum 3 photos allowed'),
});

export const bidSchema = z.object({
  amount: z.number().int().min(1, 'Bid amount must be positive'),
});

export const autobidSchema = z.object({
  maxAmount: z.number().int().min(1, 'Max amount must be positive'),
});

export const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
});