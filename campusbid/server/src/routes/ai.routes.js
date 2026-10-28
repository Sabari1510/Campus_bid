import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Auction from '../models/Auction.js';
import AiAction from '../models/AiAction.js';
import { placeBid } from '../services/bidService.js';
import AutoBid from '../models/AutoBid.js';

const router = express.Router();

const CATEGORIES = ['Electronics', 'Cycles', 'Books', 'Dorm', 'Sports', 'Clothing', 'Other'];
const CONDITIONS = ['new', 'like-new', 'used', 'damaged'];

// ── Regex fallback parser (works even without GROQ_API_KEY) ──
const parseFallback = (message) => {
  const text = message.toLowerCase();
  const intent = /\b(bid|buy|place|snipe|get it for me)\b/.test(text) ? 'BID' : 'SEARCH';

  let maxPrice = null;
  const underMatch = text.match(/(?:under|below|less than|upto|up to|max|within|budget of)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)/i);
  if (underMatch) maxPrice = Number(underMatch[1].replace(/,/g, ''));
  else {
    const rupeeMatch = text.match(/₹\s*([\d,]+(?:\.\d+)?)/);
    if (rupeeMatch) maxPrice = Number(rupeeMatch[1].replace(/,/g, ''));
  }

  let category = null;
  const catMap = {
    cycle: 'Cycles', bicycle: 'Cycles', cyclee: 'Cycles',
    book: 'Books', notes: 'Books', textbook: 'Books',
    laptop: 'Electronics', phone: 'Electronics', calculator: 'Electronics',
    earphone: 'Electronics', headphone: 'Electronics', mobile: 'Electronics',
    fridge: 'Dorm', refrigerator: 'Dorm', kettle: 'Dorm', mattress: 'Dorm',
    bat: 'Sports', football: 'Sports', shuttle: 'Sports', dumbbell: 'Sports',
    shirt: 'Clothing', jeans: 'Clothing', hoodie: 'Clothing',
  };
  for (const [kw, cat] of Object.entries(catMap)) {
    if (text.includes(kw)) { category = cat; break; }
  }

  let condition = null;
  if (/\bbrand new|brand-new|unused|never used\b/.test(text)) condition = 'new';
  else if (/\blike new|almost new\b/.test(text)) condition = 'like-new';

  // Keywords = words after stripping commands/numbers
  const keywords = text
    .replace(/(?:under|below|less than|upto|up to|max|within|budget|find|me|show|search|for|get|want|need|a|an|the|please|assistant|hey|hi|campus|available|listed|near)\b/g, ' ')
    .replace(/₹|rs\.?|inr|[\d,]+|₨/g, ' ')
    .replace(/\b(bid|buy|place|snipe|for me|auto)\b/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 4);

  return { intent, keywords, category, maxPrice, condition };
};

// ── Groq LLM parser (structured extraction) ──
const parseWithGroq = async (message) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  try {
    const body = {
      model: 'llama-3.1-8b-instant',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You extract structured auction search intents for a campus marketplace. Categories: Electronics, Cycles, Books, Dorm, Sports, Clothing, Other. Conditions: new, like-new, used, damaged. Respond ONLY with JSON: {"intent":"SEARCH"|"BID"|"HELP","keywords":["word1","word2"],"category":"<category or null>","maxPrice":<number or null>,"condition":"<condition or null>"}. intent=BID only if the user asks the assistant to bid/buy for them; otherwise SEARCH.',
        },
        { role: 'user', content: message },
      ],
    };
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return {
      intent: parsed.intent || 'SEARCH',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.filter(Boolean).slice(0, 4) : [],
      category: CATEGORIES.includes(parsed.category) ? parsed.category : null,
      maxPrice: parsed.maxPrice == null ? null : Number(parsed.maxPrice),
      condition: CONDITIONS.includes(parsed.condition) ? parsed.condition : null,
    };
  } catch {
    return null;
  }
};

const buildQuery = (intent) => {
  const now = new Date();
  const q = { status: 'ACTIVE', closesAt: { $gt: now } };
  const parts = [];
  if (intent.keywords && intent.keywords.length > 0) {
    q.$or = intent.keywords.map((k) => ({
      title: { $regex: k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
    }));
    parts.push(`"${intent.keywords.join(' / ')}"`);
  } else {
    parts.push('everything live right now');
  }
  if (intent.category) { q.category = intent.category; parts.push(`category: ${intent.category}`); }
  if (intent.condition) { q.condition = intent.condition; parts.push(`condition: ${intent.condition}`); }
  if (intent.maxPrice) {
    q.currentPrice = { $lte: intent.maxPrice };
    parts.push(`at or under ₹${intent.maxPrice}`);
  }
  return { q, parts };
};

// ── AI chat endpoint ──
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const message = (req.body.message || '').toString().slice(0, 500);
    if (!message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let intent = await parseWithGroq(message);
    let engine = 'groq';
    if (!intent) {
      intent = parseFallback(message);
      engine = 'regex';
    }

    // HELP intent
    if (intent.intent === 'HELP') {
      return res.json({
        reply: "I can help you: 1) Search — say \u201Cfind me a cycle under ₹2,000\u201D. 2) Bid — say \u201Cbid on the red cycle up to ₹1,500\u201D and I'll propose it for your one-tap confirmation. I never place a bid without your explicit go-ahead, never exceed the limit you set, and I never reveal other students' account details.",
        listings: null,
        action: null,
      });
    }

    const { q, parts } = buildQuery(intent);
    let listings = await Auction.find(q).sort({ closesAt: 1 }).limit(5)
      .populate('sellerId', 'name');
    listings = listings.map((a) => ({
      _id: a._id,
      title: a.title,
      description: a.description,
      category: a.category,
      condition: a.condition,
      currentPrice: a.currentPrice,
      startPrice: a.startPrice,
      minIncrement: a.minIncrement,
      closesAt: a.closesAt,
      photos: a.photos,
      sellerName: a.sellerId?.name || 'Graduating Senior',
      // NOTE: seller email / account details intentionally NOT exposed
    }));

    let reply;
    let action = null;

    if (listings.length === 0) {
      reply = `I searched live lots for ${parts.join(', ')}, but nothing matches right now. Want me to widen the search (remove price cap or condition), or set a Wanted alert on the Wanted tab so you're notified the moment someone lists it?`;
    } else if (intent.intent === 'BID' && intent.maxPrice) {
      // Propose — never act. Budget is capped exactly at the student's stated limit.
      const target = listings[0];
      const nextMin = target.currentPrice + (target.minIncrement || 10);
      if (intent.maxPrice < nextMin) {
        reply = `I can't bid within ₹${intent.maxPrice} on "${target.title}" — the next minimum bid is ₹${nextMin}. Raise your limit or pick another lot.`;
      } else {
        const aiAction = await AiAction.create({
          userId: req.user.userId,
          auctionId: target._id,
          maxAmount: intent.maxPrice,
          status: 'pending',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });
        reply = `Best match: "${target.title}" at ₹${target.currentPrice} (next minimum bid ₹${nextMin}). I can keep a proxy for you that bids only up to your limit of ₹${intent.maxPrice} — same rules as a human bidder, nothing without your confirmation.`;
        action = {
          id: aiAction._id,
          auctionId: target._id,
          title: target.title,
          maxAmount: intent.maxPrice,
          currency: 'INR',
        };
      }
    } else {
      const top = listings[0];
      reply = `Found ${listings.length} live lot${listings.length > 1 ? 's' : ''} for ${parts.join(', ')}. Top pick: "${top.title}" at ₹${top.currentPrice}, closing ${new Date(top.closesAt).toLocaleString()}. Say "bid on this up to ₹<your limit>" and I'll set up a proposal for you.`;
    }

    res.json({ reply, listings, action, engine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Confirm an AI-proposed bid (the student's go-ahead) ──
router.post('/actions/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const aiAction = await AiAction.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!aiAction) return res.status(404).json({ message: 'Action not found' });
    if (aiAction.status !== 'pending') return res.status(400).json({ message: `Action already ${aiAction.status}` });
    if (aiAction.expiresAt && aiAction.expiresAt < new Date()) {
      aiAction.status = 'expired';
      await aiAction.save();
      return res.status(400).json({ message: 'Proposal expired — ask me again' });
    }

    const auction = await Auction.findById(aiAction.auctionId);
    if (!auction || auction.status !== 'ACTIVE' || new Date() >= auction.closesAt) {
      aiAction.status = 'expired';
      await aiAction.save();
      return res.status(400).json({ message: 'Auction is no longer live' });
    }
    if (auction.sellerId.toString() === req.user.userId.toString()) {
      return res.status(403).json({ message: "You can't bid on your own listing" });
    }

    const nextMin = auction.currentPrice + (auction.minIncrement || 10);
    if (aiAction.maxAmount < nextMin) {
      return res.status(400).json({ message: `Your limit ₹${aiAction.maxAmount} is below the next minimum bid ₹${nextMin}` });
    }

    // Hard safety rail: never beyond the agreed limit
    const cappedBid = Math.min(nextMin, aiAction.maxAmount);

    // Register the proxy so the system keeps bidding for them — but never above the cap
    await AutoBid.findOneAndUpdate(
      { auctionId: auction._id, userId: req.user.userId },
      { maxAmount: aiAction.maxAmount },
      { upsert: true, new: true }
    );

    // Place the opening bid through the SAME placeBid rules everyone uses
    const bid = await placeBid(auction._id, req.user.userId, cappedBid, true);

    aiAction.status = 'confirmed';
    await aiAction.save();

    res.json({
      message: `Confirmed! Your proxy is active on "${auction.title}" — capped at ₹${aiAction.maxAmount}. Opening bid ₹${cappedBid} placed.`,
      bid: bid.bid,
      auction: { _id: auction._id, title: auction.title, currentPrice: auction.currentPrice },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;