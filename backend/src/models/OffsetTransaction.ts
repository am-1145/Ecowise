import { Schema, model, Document } from 'mongoose';

export interface IOffsetTransaction extends Document {
  userId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  amountPaid: number;
  carbonOffsetKg: number;
  projectName: string;
  provider: string;
  status: 'pending' | 'completed' | 'failed';
  certificateUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OffsetTransactionSchema = new Schema<IOffsetTransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'MarketplaceProduct', required: true },
  amountPaid: { type: Number, required: true },
  carbonOffsetKg: { type: Number, required: true },
  projectName: { type: String, required: true },
  provider: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  certificateUrl: { type: String },
}, {
  timestamps: true
});

export const OffsetTransaction = model<IOffsetTransaction>('OffsetTransaction', OffsetTransactionSchema);
