import mongoose, { Schema } from 'mongoose';

const autoBidSchema = new Schema(
  {
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    maxAmount: {
      type: Number,
      required: [true, 'Max amount is required'],
      min: [0, 'Max amount must be positive'],
    },
  },
  {
    timestamps: true,
    indexes: [
      { auctionId: 1, userId: 1, unique: true },
    ],
  }
);

export default mongoose.model('AutoBid', autoBidSchema);