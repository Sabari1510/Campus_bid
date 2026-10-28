import mongoose, { Schema } from 'mongoose';

const wantedSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    keywords: {
      type: [String],
      required: [true, 'Keywords are required'],
    },
    category: {
      type: String,
    },
    maxPrice: {
      type: Number,
      min: [0, 'Max price must be positive'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Wanted', wantedSchema);