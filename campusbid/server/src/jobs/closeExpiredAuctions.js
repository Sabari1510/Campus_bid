import Auction from '../models/Auction.js';
import Notification from '../models/Notification.js';

const closeExpiredAuctions = async () => {
  try {
    const now = new Date();
    const expired = await Auction.find({ status: 'ACTIVE', closesAt: { $lte: now } });

    for (const auc of expired) {
      auc.status = 'CLOSED';
      await auc.save();

      const notifications = [];
      if (auc.leaderId) {
        notifications.push({
          userId: auc.leaderId,
          type: 'auction_closed',
          payload: {
            auctionId: auc._id,
            title: auc.title,
            message: `🏆 You won "${auc.title}" with a bid of ₹${auc.currentPrice}! Complete the handover.`,
          },
        });
      }
      notifications.push({
        userId: auc.sellerId,
        type: 'auction_closed',
        payload: {
          auctionId: auc._id,
          title: auc.title,
          message: auc.leaderId
            ? `Your auction "${auc.title}" closed. Winning bid: ₹${auc.currentPrice}.`
            : `Your auction "${auc.title}" closed with no bids.`,
        },
      });

      try {
        await Notification.insertMany(notifications, { ordered: false });
      } catch (notifyErr) {
        console.error('[CLOSE_JOB] notification failed:', notifyErr.message);
      }
    }

    if (expired.length > 0) {
      console.log(`[CLOSE_JOB] Closed ${expired.length} expired auction(s)`);
    }
  } catch (err) {
    console.error('[CLOSE_JOB]', err.message);
  }
};

export const startCloseJob = () => {
  closeExpiredAuctions();
  setInterval(closeExpiredAuctions, 30000);
};