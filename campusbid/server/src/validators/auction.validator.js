import { z } from 'zod';

export const updateListingSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  condition: z.enum(['new', 'like-new', 'used', 'damaged']).optional(),
  startPrice: z.number().int().min(0).optional(),
  minIncrement: z.number().int().min(1).optional(),
});

export const cancelListingSchema = z.object({});