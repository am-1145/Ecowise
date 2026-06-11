import { Schema, model, Document } from 'mongoose';

export interface IActionItem extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  description: string;
  category: 'transportation' | 'energy' | 'food' | 'waste' | 'water' | 'shopping';
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedSavings: number; // kg CO2 saved per year/event
  timeRequired: string; // e.g. "5 mins", "1 week"
  status: 'planned' | 'active' | 'completed';
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ActionItemSchema = new Schema<IActionItem>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['transportation', 'energy', 'food', 'waste', 'water', 'shopping'],
    required: true
  },
  impact: { type: String, enum: ['high', 'medium', 'low'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  estimatedSavings: { type: Number, required: true },
  timeRequired: { type: String, required: true },
  status: { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' },
  isCustom: { type: Boolean, default: false },
}, {
  timestamps: true
});

export const ActionItem = model<IActionItem>('ActionItem', ActionItemSchema);
