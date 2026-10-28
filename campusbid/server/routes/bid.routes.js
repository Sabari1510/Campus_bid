import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { placeBid } from '../services/bidService.js';

const router = express.Router();

// Place a bid on an auction
router.post('/:id', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const result = await placeBid(req.params.id, req.user.userId, amount, false);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;