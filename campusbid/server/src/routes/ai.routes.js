import express from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.js';
import Auction from '../models/Auction.js';
import AiAction from '../models/AiAction.js';
import { placeBid } from '../services/bidService.js';
import AutoBid from '../models/AutoBid.js';

const router = express.Router();

const CATEGORIES = ['Electronics', 'Cycles', 'Books', 'Dorm', 'Sports', 'Clothing', 'Other'];
const CONDITIONS = ['new', 'like-new', 'used', 'damaged'];

// Optional auth for chat queries (login only required when creating proposals / bidding)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

// ── Regex fallback parser ──
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

  // Strip stop words, category words, price words
  const stopWords = [
    'under', 'below', 'less', 'than', 'upto', 'up', 'to', 'max', 'within', 'budget',
    'find', 'me', 'show', 'search', 'for', 'get', 'want', 'need', 'a', 'an', 'the',
    'please', 'assistant', 'hey', 'hi', 'campus', 'available', 'listed', 'near',
    'how', 'many', 'are', 'there', 'is', 'any', 'which', 'what',
  ];

  const keywords = text
    .replace(/₹|rs\.?|inr|[\d,]+|₨/g, ' ')
    .replace(/\b(bid|buy|place|snipe|for me|auto)\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.includes(w))
    .filter(Boolean)
    .slice(0, 4);

  return { intent, keywords, category, maxPrice, condition };
};

// ── Groq LLM parser ──
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
            'You extract structured auction search intents for a campus marketplace. Categories: Electronics, Cycles, Books, Dorm, Sports, Clothing, Other. Conditions: new, like-new, used, damaged. Respond ONLY with JSON: {"intent":"SEARCH"|"BID"|"HELP","keywords":["word1","word2"],"category":"<category or null>","maxPrice":<number or null>,"condition":"<condition or null>"}. Strip plural suffixes from keywords (e.g. "books" -> "book"). intent=BID only if the user asks the assistant to bid/buy for them; otherwise SEARCH.',
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
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.map(k => String(k).toLowerCase()).filter(Boolean).slice(0, 4)
        : [],
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

  if (intent.category) {
    q.category = intent.category;
    parts.push(`category: ${intent.category}`);
  }

  // Add keyword search over title and description if meaningful keywords exist
  if (intent.keywords && intent.keywords.length > 0) {
    q.$or = intent.keywords.map((k) => {
      const pluralRegex = k.endsWith('s') ? k.slice(0, -1) + '(s)?' : k;
      return [
        { title: { $regex: pluralRegex, $options: 'i' } },
        { description: { $regex: pluralRegex, $options: 'i' } }
      ];
    }).flat();
    parts.push(`keywords: "${intent.keywords.join(' / ')}"`);
  } else if (!intent.category) {
    // If no keywords and no category, then search everything (default above covers it)
    parts.push('everything live');
  }

  if (intent.condition) {
    q.condition = intent.condition;
    parts.push(`condition: ${intent.condition}`);
  }

  if (intent.maxPrice) {
    q.$or = q.$or || []; // Ensure $or exists if other keyword-based $or is not present
    q.$or.push(
      { currentPrice: { $lte: intent.maxPrice } },
      { startPrice: { $lte: intent.maxPrice } }
    );
    parts.push(`at or under ₹${intent.maxPrice} (by current or start price)`);
  }

  return { q, parts };
};

// ── AI chat endpoint ──
router.post('/chat', optionalAuth, async (req, res) => {
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

    if (intent.intent === 'HELP') {
      return res.json({
        reply: "I can help you: 1) Search — say \u201Cfind me a cycle under ₹2,000\u201D. 2) Bid — say \u201Cbid on the red cycle up to ₹1,500\u201D and I'll propose it for your one-tap confirmation. I never place a bid without your explicit go-ahead, never exceed the limit you set, and I never reveal other students' account details.",
        listings: null,
        action: null,
      });
    }

    const { q, parts } = buildQuery(intent);
    let listings = await Auction.find(q).sort({ currentPrice: 1, closesAt: 1 }).limit(10)
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
    }));

    let reply;
    let action = null;

    if (listings.length === 0) {
      reply = `I searched live lots for ${parts.join(', ')}, but nothing matches right now. Want me to widen the search (remove price cap or condition), or set a Wanted alert on the Wanted tab so you're notified the moment someone lists it?`;
    } else if (intent.intent === 'BID' && intent.maxPrice) {
      if (!req.user) {
        reply = `Found "${listings[0].title}" at ₹${listings[0].currentPrice}. Please log in first so I can set up your bid proposal!`;
      } else {
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
      }
    } else {
      const top = listings[0];
      const countMsg = listings.length === 1 ? '1 live lot' : `${listings.length} live lots`;
      reply = `Found ${countMsg} for ${parts.join(', ')}. Top match: "${top.title}" at ₹${top.currentPrice}, closing ${new Date(top.closesAt).toLocaleString()}. Say "bid on this up to ₹<your limit>" if you want me to prepare a bid proposal for you.`;
    }

    res.json({ reply, listings, action, engine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Confirm an AI-proposed bid ──
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

    const cappedBid = Math.min(nextMin, aiAction.maxAmount);

    await AutoBid.findOneAndUpdate(
      { auctionId: auction._id, userId: req.user.userId },
      { maxAmount: aiAction.maxAmount },
      { upsert: true, new: true }
    );

    const bid = await placeBid(auction._id, req.user.userId, cappedBid, true);

    aiAction.status = 'confirmed';
    await aiAction.save();

    res.json({
      message: `Confirmed! Your auto-bid proxy is now set on "${auction.title}" with a maximum limit of ₹${aiAction.maxAmount}. An initial bid of ₹${cappedBid} has been placed to take the lead.`,
      bid: bid.bid,
      auction: { _id: auction._id, title: auction.title, currentPrice: auction.currentPrice },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;