import Auction from '../models/Auction.js';
import User from '../models/User.js';

export const closeAuction = async (auctionId) => {
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    throw new Error('Auction not found');
  }

  const now = new Date();

  // If there are no bids, item is UNSOLD
  if (auction.bidCount === 0) {
    auction.status = 'UNSOLD';
    auction.outcomeNote = 'No bids received';
    await auction.save();
    return { auction, status: 'UNSOLD' };
  }

  // Item goes to PENDING_APPROVAL with top bidder
  auction.status = 'PENDING_APPROVAL';
  await auction.save();
  
  return { auction, status: 'PENDING_APPROVAL' with top bidder: auction.leaderId };
};

export const approveWinner = async (auctionId, sellerId) => {
  const auction = await Auction.findById(auctionId);
  if (!auction || auction.sellerId.toString() !== sellerId.toString()) {
    throw new Error('Unauthorized or auction not found');
  }

  if (auction.status !== 'PENDING_APPROVAL') {
    throw new Error('Auction is not in pending approval state');
  }

  auction.status = 'RESERVED';
  await auction.save();
  
  return { auction, status: 'RESERVED' };
};

export const completeHandover = async (auctionId, sellerId, outcome) => {
  const auction = await Auction.findById(auctionId);
  if (!auction || auction.sellerId.toString() !== sellerId.toString()) {
    throw new Error('Unauthorized or auction not found');
  }

  auction.status = outcome === 'completed' ? 'COMPLETED' : 'PICKUP_FAILED';
  auction.outcomeNote = outcome;
  await auction.save();
  
  return { auction, status: auction.status };
};

export const cancelAuction = async (auctionId, sellerId) => {
  const auction = await Auction.findById(auctionId);
  if (!auction || auction.sellerId.toString() !== sellerId.toString()) {
    throw new Error('Unauthorized or auction not found');
  }

  auction.status = 'CANCELLED';
  auction.outcomeNote = 'Auction cancelled by seller';
  await auction.save();
  
  return { auction, status: 'CANCELLED' };
};