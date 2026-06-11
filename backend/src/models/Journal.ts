import { Schema, model, Document } from 'mongoose';

export interface IJournal extends Document {
  userId: Schema.Types.ObjectId;
  date: Date;
  mood: number; // Scale 1 - 10
  entryText: string;
  carbonScoreRating: number; // Scale 1 - 10 based on how eco-friendly they felt
  activities: string[]; // e.g., ["walked to work", "reused water bottles", "ate vegan"]
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, default: Date.now, index: true },
  mood: { type: Number, required: true, min: 1, max: 10 },
  entryText: { type: String, required: true },
  carbonScoreRating: { type: Number, required: true, min: 1, max: 10 },
  activities: [{ type: String }],
}, {
  timestamps: true
});

// Ensure only one journal entry per user per day
JournalSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Journal = model<IJournal>('Journal', JournalSchema);
