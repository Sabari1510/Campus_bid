import mongoose, { Schema } from 'mongoose';

const bidSchema = new Schema(
  {
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    bidderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: [0, 'Bid amount must be positive'],
    },
    isAuto: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

bidSchema.index({ auctionId: 1, createdAt: 1 });

export default mongoose.model('Bid', bidSchema);