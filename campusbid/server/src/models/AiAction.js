import mongoose, { Schema } from 'mongoose';

const aiActionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    maxAmount: {
      type: Number,
      required: [true, 'Max amount is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'expired'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('AiAction', aiActionSchema);