import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { placeBid, checkExtension } from '../services/bidService.js';
import { closeAuction, approveWinner, completeHandover, cancelAuction } from '../services/lifecycleService.js';
import Auction from '../models/Auction.js';
import Question from '../models/Question.js';
import router from './auth.routes.js';

const router = express.Router();

// Get all auctions with filters
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q, category, condition, min, max, closingSoon } = req.query;
    let filter = { status: 'ACTIVE' };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (min) filter.currentPrice = { $gte: Number(min) };
    if (max) filter.currentPrice = { ...filter.currentPrice, $lte: Number(max) };
    if (closingSoon) {
      const now = new Date();
      const thirtyLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      filter.closesAt = { $lt: thirtyLater, $gt: now };
    }

    const auctions = await Auction.find(filter)
      .sort({ closesAt: 1 })
      .limit(20);
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single auction details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('sellerId', 'name email')
      .populate('leaderId', 'name');
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create listing
router.post('/', authMiddleware, upload.array('photos', 3), async (req, res) => {
  try {
    const { title, description, category, condition, startPrice, minIncrement, closesAt } = req.body;
    const photos = req.files ? req.files.map(f => f.path) : [];

    const auction = await Auction.create({
      sellerId: req.user.userId,
      title,
      description,
      category,
      condition,
      photos,
      startPrice: Number(startPrice),
      minIncrement: Number(minIncrement || 10),
      currentPrice: Number(startPrice),
      closesAt: new Date(closesAt),
      status: 'ACTIVE',
    });

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit listing (seller only, after first bid only description editable)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    if (auction.sellerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // After first bid, only description is editable
    if (auction.bidCount > 0 && req.body.title) {
      return res.status(400).json({ message: 'Title cannot be edited after first bid' });
    }

    const updates = { ...req.body };
    if (updates.closesAt) updates.closesAt = new Date(updates.closesAt);
    Object.keys(updates).forEach((key) => auction[key] = updates[key]);
    await auction.save();

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel listing
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const result = await cancelAuction(req.params.id, req.user.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Place bid
router.post('/:id/bids', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const result = await placeBid(req.params.id, req.user.userId, amount, false);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Set auto-bid max
router.put('/:id/autobid', authMiddleware, async (req, res) => {
  try {
    const { maxAmount } = req.body;
    const autobid = await AutoBid.findOneAndUpdate(
      { auctionId: req.params.id, userId: req.user.userId },
      { maxAmount },
      { upsert: true, new: true }
    );
    res.json(autobid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Make decision (approve/reject)
router.post('/:id/decision', authMiddleware, async (req, res) => {
  try {
    const { approve } = req.body;
    const result = await approveWinner(req.params.id, req.user.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handover
router.post('/:id/handover', authMiddleware, async (req, res) => {
  try {
    const { outcome } = req.body;
    const result = await completeHandover(req.params.id, req.user.userId, outcome);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ask question
router.post('/:id/questions', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const question = await Question.create({
      auctionId: req.params.id,
      askerId: req.user.userId,
      text,
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Answer question
router.post('/questions/:qid/answer', authMiddleware, async (req, res) => {
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

// Hide question spam
router.post('/questions/:qid/hide', authMiddleware, async (req, res) => {
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