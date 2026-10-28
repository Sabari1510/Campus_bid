import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import AiAction from '../models/AiAction.js';

const router = express.Router();

// AI chat - send request to Groq
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, auctionId, maxAmount } = req.body;
    
    // TODO: Call Groq API with tools
    // For now, return fallback response
    const response = {
      response: 'AI assistant is coming soon. This is a fallback message.',
      suggestions: [],
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm AI action
router.post('/actions/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const aiAction = await AiAction.findByIdAndUpdate(
      id,
      { status: 'confirmed' },
      { new: true }
    );
    res.json(aiAction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;