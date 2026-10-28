import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Wanted from '../models/Wanted.js';

const router = express.Router();

// Get user's wanted alerts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const wanted = await Wanted.find({ userId: req.user.userId });
    res.json(wanted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update wanted alert
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { keywords, category, maxPrice } = req.body;
    const wanted = await Wanted.findOneAndUpdate(
      { userId: req.user.userId },
      { keywords, category, maxPrice, active: true },
      { upsert: true, new: true }
    );
    res.json(wanted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete wanted alert
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Wanted.findByIdAndDelete(req.params.id);
    res.json({ message: 'Wanted alert removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;