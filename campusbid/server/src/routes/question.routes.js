import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Question from '../models/Question.js';
import Auction from '../models/Auction.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get questions for an auction (PUBLIC — visible to everyone)
router.get('/:auctionId', async (req, res) => {
  try {
    const questions = await Question.find({ auctionId: req.params.auctionId, hidden: false })
      .populate('askerId', 'name')
      .sort({ createdAt: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ask a question (any logged-in user)
router.post('/:auctionId', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Question text is required' });
    }

    const question = await Question.create({
      auctionId: req.params.auctionId,
      askerId: req.user.userId,
      text: text.trim(),
    });

    // Notify the seller
    try {
      if (auction.sellerId.toString() !== req.user.userId.toString()) {
        await Notification.create({
          userId: auction.sellerId,
          type: 'new_question',
          payload: {
            auctionId: auction._id,
            questionId: question._id,
            questionText: question.text,
            message: `New question on "${auction.title}": ${question.text}`,
          },
        });
      }
    } catch (notifyErr) {
      console.error('Question notification failed:', notifyErr.message);
    }

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Answer a question (seller only)
router.post('/:qid/answer', authMiddleware, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: 'Answer text is required' });
    }

    const question = await Question.findById(req.params.qid);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const auction = await Auction.findById(question.auctionId);
    if (!auction || auction.sellerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Only the seller can answer' });
    }

    question.answer = answer.trim();
    question.answeredAt = new Date();
    await question.save();

    // Notify the asker
    try {
      if (question.askerId.toString() !== req.user.userId.toString()) {
        await Notification.create({
          userId: question.askerId,
          type: 'question_answered',
          payload: {
            auctionId: auction._id,
            questionId: question._id,
            message: `Seller answered your question on "${auction.title}"`,
          },
        });
      }
    } catch (notifyErr) {
      console.error('Answer notification failed:', notifyErr.message);
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Hide question spam (seller only)
router.post('/:qid/hide', authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.qid);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    const auction = await Auction.findById(question.auctionId);
    if (!auction || auction.sellerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Only the seller can hide questions' });
    }
    question.hidden = true;
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;