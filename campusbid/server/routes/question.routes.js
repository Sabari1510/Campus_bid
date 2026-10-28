import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Question from '../models/Question.js';

const router = express.Router();

// Get questions for an auction
router.get('/:auctionId', authMiddleware, async (req, res) => {
  try {
    const questions = await Question.find({ auctionId: req.params.auctionId })
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ask a question
router.post('/:auctionId', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const question = await Question.create({
      auctionId: req.params.auctionId,
      askerId: req.user.userId,
      text,
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Answer a question (seller only)
router.post('/:qid/answer', authMiddleware, async (req, res) => {
  try {
    const { answer } = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.qid,
      { answer, answeredAt: new Date() },
      { new: true }
    );
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Hide spam (seller only)
router.post('/:qid/hide', authMiddleware, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.qid,
      { hidden: true },
      { new: true }
    );
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;