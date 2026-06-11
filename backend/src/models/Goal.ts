import { Schema, model, Document } from 'mongoose';

export interface IMilestone {
  label: string;
  targetValue: number;
  achieved: boolean;
  achievedAt?: Date;
}

export interface IGoal extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  description?: string;
  category: 'transportation' | 'energy' | 'food' | 'waste' | 'water' | 'general';
  targetValue: number; // e.g., target 20% reduction or target absolute footprint
  currentValue: number;
  status: 'active' | 'achieved' | 'failed';
  deadline: Date;
  milestones: IMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>({
  label: { type: String, required: true },
  targetValue: { type: Number, required: true },
  achieved: { type: Boolean, default: false },
  achievedAt: { type: Date },
}, { _id: false });

const GoalSchema = new Schema<IGoal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    enum: ['transportation', 'energy', 'food', 'waste', 'water', 'general'],
    required: true
  },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'achieved', 'failed'], default: 'active' },
  deadline: { type: Date, required: true },
  milestones: [MilestoneSchema],
}, {
  timestamps: true
});

export const Goal = model<IGoal>('Goal', GoalSchema);
