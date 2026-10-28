import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { placeBid, checkExtension } from '../services/bidService.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Wanted from '../models/Wanted.js';
import Notification from '../models/Notification.js';
import AutoBid from '../models/AutoBid.js';

const router = express.Router();

// Get all auctions with filters (Public)
router.get('/', async (req, res) => {
  try {
    const { q, category, condition, min, max, closingSoon, sellerId, status } = req.query;
    const now = new Date();
    let filter = {};

    if (sellerId) {
      filter.sellerId = sellerId;
      if (status === 'CLOSED') {
        filter.$or = [{ status: 'CLOSED' }, { closesAt: { $lte: now } }];
      }
    } else if (status === 'CLOSED') {
      // Closed: explicitly closed, or expired but not yet swept
      filter.$or = [{ status: 'CLOSED' }, { closesAt: { $lte: now } }];
    } else {
      // Live: active AND not yet expired
      filter.status = 'ACTIVE';
      filter.closesAt = { $gt: now };
    }

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
      .limit(50);
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// My listings (auth required) — must be before /:id
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const auctions = await Auction.find({ sellerId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single auction details (Public)
router.get('/:id', async (req, res) => {
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

// Get bids for single auction (Public)
router.get('/:id/bids', async (req, res) => {
  try {
    const bids = await Bid.find({ auctionId: req.params.id })
      .populate('bidderId', 'name')
      .sort({ amount: -1 })
      .limit(30);
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create listing
router.post('/', authMiddleware, upload.array('photos', 3), async (req, res) => {
  try {
    const { title, description, category, condition, startPrice, minIncrement, closesAt } = req.body;

    const photoUrls = req.files
      ? req.files.map((f) => ({ url: `/uploads/${f.filename}`, publicId: f.filename }))
      : [];

    const auction = await Auction.create({
      sellerId: req.user.userId,
      title,
      description,
      category,
      condition,
      photos: photoUrls,
      startPrice: Number(startPrice),
      minIncrement: Number(minIncrement || 10),
      currentPrice: Number(startPrice),
      closesAt: new Date(closesAt),
      status: 'ACTIVE',
    });

    res.status(201).json(auction);

    // Fire-and-forget: notify users whose Wanted alerts match this listing
    try {
      const titleLower = (title || '').toLowerCase();
      const wantedAlerts = await Wanted.find({ active: true, userId: { $ne: req.user.userId } });
      for (const w of wantedAlerts) {
        const kwMatch = (w.keywords || []).some((k) => k && titleLower.includes(k.toLowerCase().trim()));
        const catMatch = w.category && w.category === category;
        const priceOk = !w.maxPrice || Number(startPrice) <= w.maxPrice;
        if ((kwMatch || catMatch) && priceOk) {
          await Notification.create({
            userId: w.userId,
            type: 'wanted_match',
            payload: {
              auctionId: auction._id,
              title: auction.title,
              startPrice: auction.startPrice,
              message: `New listing matches your wanted alert: ${auction.title}`,
            },
          });
        }
      }
    } catch (notifyErr) {
      console.error('Wanted match notification failed:', notifyErr.message);
    }
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
    const auction = await Auction.findByIdAndUpdate(
      req.params.id,
      { status: 'CANCELLED', outcomeNote: 'Auction cancelled by seller' },
      { new: true }
    );
    res.json(auction);
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

// Set auto-bid proxy (proper: AutoBid record + real bid through placeBid rules)
router.put('/:id/autobid', authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction || auction.status !== 'ACTIVE' || new Date() >= auction.closesAt) {
      return res.status(400).json({ message: 'Auction is not live' });
    }
    if (auction.sellerId.toString() === req.user.userId.toString()) {
      return res.status(403).json({ message: "You can't auto-bid on your own listing" });
    }

    const maxAmount = Number(req.body.maxAmount);
    const nextMin = auction.currentPrice + (auction.minIncrement || 10);
    if (!maxAmount || maxAmount < nextMin) {
      return res.status(400).json({ message: `Max amount must be at least ₹${nextMin}` });
    }

    await AutoBid.findOneAndUpdate(
      { auctionId: auction._id, userId: req.user.userId },
      { maxAmount },
      { upsert: true, new: true }
    );

    const bid = await placeBid(auction._id, req.user.userId, nextMin, true);
    res.json({ message: `Auto-bid active, capped at ₹${maxAmount}`, bid: bid.bid });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Make decision (approve/reject)
router.post('/:id/decision', authMiddleware, async (req, res) => {
  try {
    const { approve } = req.body;
    res.json({ message: `Decision ${approve ? 'approve' : 'reject'} recorded` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handover
router.post('/:id/handover', authMiddleware, async (req, res) => {
  try {
    const { outcome } = req.body;
    res.json({ message: `Handover ${outcome} recorded` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ask question
router.post('/:id/questions', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    res.json({ message: 'Question created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Answer question
router.post('/questions/:qid/answer', authMiddleware, async (req, res) => {
  try {
    const { answer } = req.body;
    res.json({ message: 'Answer posted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Hide question spam
router.post('/questions/:qid/hide', authMiddleware, async (req, res) => {
  try {
    res.json({ message: 'Question hidden' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;