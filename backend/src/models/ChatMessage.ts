import { Schema, model, Document } from 'mongoose';

export interface IChatMessage extends Document {
  userId: Schema.Types.ObjectId;
  role: 'user' | 'model';
  parts: string;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['user', 'model'], required: true },
  parts: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ChatMessage = model<IChatMessage>('ChatMessage', chatMessageSchema);
