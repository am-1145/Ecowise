import { Schema, model, Document } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  category: 'transportation' | 'energy' | 'food' | 'waste' | 'water' | 'shopping';
  targetValue?: number;
  durationDays: number;
  participantsCount: number;
  xpReward: number;
  pointsReward: number;
  badgeReward?: string;
  qrCodeData: string; // Used for challenge check-ins
  startDate: Date;
  endDate: Date;
  rules: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['transportation', 'energy', 'food', 'waste', 'water', 'shopping'],
    required: true
  },
  targetValue: { type: Number },
  durationDays: { type: Number, required: true },
  participantsCount: { type: Number, default: 0 },
  xpReward: { type: Number, required: true },
  pointsReward: { type: Number, required: true },
  badgeReward: { type: String },
  qrCodeData: { type: String, required: true, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rules: [{ type: String }],
}, {
  timestamps: true
});

export const Challenge = model<IChallenge>('Challenge', ChallengeSchema);
