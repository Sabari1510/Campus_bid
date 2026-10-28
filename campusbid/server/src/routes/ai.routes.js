import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// AI chat - send request to Groq
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, auctionId, maxAmount } = req.body;
    res.json({ response: 'AI coming soon', suggestions: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm AI action
router.post('/actions/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ message: 'AI action confirmed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;