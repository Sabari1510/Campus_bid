import mongoose, { Schema } from 'mongoose';

const auctionSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      enum: ['new', 'like-new', 'used', 'damaged'],
      default: 'used',
    },
    photos: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
        },
      },
    ],
    startPrice: {
      type: Number,
      required: [true, 'Start price is required'],
      min: [0, 'Start price must be positive'],
    },
    minIncrement: {
      type: Number,
      required: [true, 'Minimum increment is required'],
      min: [1, 'Minimum increment must be at least 1'],
      default: 10,
    },
    currentPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    bidCount: {
      type: Number,
      default: 0,
    },
    version: {
      type: Number,
      default: 0,
    },
    closesAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_APPROVAL', 'UNSOLD', 'RESERVED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'PICKUP_FAILED'],
      default: 'ACTIVE',
    },
    outcomeNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Auction', auctionSchema);