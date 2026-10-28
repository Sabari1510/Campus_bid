import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import AutoBid from '../models/AutoBid.js';

export const placeBid = async (auctionId, bidderId, amount, isAuto = false) => {
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    throw new Error('Auction not found');
  }

  const now = new Date();
  if (now >= auction.closesAt) {
    throw new Error('Auction has closed');
  }

  const minBid = auction.currentPrice + auction.minIncrement;
  if (amount < minBid) {
    throw new Error(`Bid must be at least ₹${minBid}`);
  }

  // Conditional update with version check to prevent race conditions
  const result = await Auction.findOneAndUpdate(
    {
      _id: auctionId,
      closesAt: { $gt: now },
      version: auction.version,
    },
    {
      $set: {
        currentPrice: amount,
        leaderId: bidderId,
        bidCount: auction.bidCount + 1,
        version: auction.version + 1,
      },
    },
    { new: true, upsert: false }
  );

  if (!result) {
    throw new Error('Could not place bid - concurrent update or auction closed');
  }

  // Create bid record
  const bid = await Bid.create({
    auctionId,
    bidderId,
    amount,
    isAuto,
  });

  // Handle auto-bid if this was an auto-bid
  if (isAuto) {
    await resolveAutoBid(auctionId, bidderId, amount);
  }

  // Check for extension (30s rule)
  await checkExtension(auctionId);

  return { auction: result, bid };
};

export const resolveAutoBid = async (auctionId, currentUserId, currentAmount) => {
  const auction = await Auction.findById(auctionId);
  const autobids = await AutoBid.find({ auctionId });

  // Find the current user's auto-bid
  const userAutoBid = autobids.find((ab) => ab.userId.toString() === currentUserId.toString());
  
  if (!userAutoBid) return;

  // Find competing max bids that are higher than current
  const competingMaxes = autobids
    .filter((ab) => ab.userId.toString() !== currentUserId.toString() && ab.maxAmount > currentAmount)
    .sort((a, b) => b.maxAmount - a.maxAmount);

  if (competingMaxes.length === 0) {
    // No competing max, user stays in lead
    return;
  }

  const competingMax = competingMaxes[0];
  
  const nextMinToOutbid = currentAmount + (auction.minIncrement || 10);
  let autoBidAmount = nextMinToOutbid;

  // If the competing max is higher, our auto-bid might need to be higher
  if (competingMax.maxAmount >= nextMinToOutbid) {
    autoBidAmount = Math.min(competingMax.maxAmount + (auction.minIncrement || 10), userAutoBid.maxAmount);
  } else {
    // Competing max is lower than our next min, so we bid our next min
    autoBidAmount = Math.min(nextMinToOutbid, userAutoBid.maxAmount);
  }

  // Ensure we actually outbid and don't exceed our own max
  if (autoBidAmount <= currentAmount || autoBidAmount > userAutoBid.maxAmount) {
    return; // Cannot outbid within our max, or already leading, or competing max is too low
  }

  await placeBid(auctionId, currentUserId, autoBidAmount, true);
};

export const checkExtension = async (auctionId) => {
  const auction = await Auction.findById(auctionId);
  const now = new Date();
  const timeUntilClose = auction.closesAt - now;

  // If within 30 seconds, extend by 60 seconds
  if (timeUntilClose <= 30 * 1000) {
    auction.closesAt = new Date(now.getTime() + 60 * 1000);
    auction.version = (auction.version || 0) + 1;
    await auction.save();
    
    // Notify via SSE
    // TODO: emit extension event to connected clients
  }
};