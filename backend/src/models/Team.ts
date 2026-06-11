import { Schema, model, Document } from 'mongoose';

export interface ITeamMember {
  userId: Schema.Types.ObjectId;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface ITeam extends Document {
  name: string;
  type: 'family' | 'team';
  members: ITeamMember[];
  inviteCode: string;
  totalPoints: number;
  totalCarbonSaved: number; // in kg CO2
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true, trim: true, unique: true },
  type: { type: String, enum: ['family', 'team'], required: true },
  members: [TeamMemberSchema],
  inviteCode: { type: String, required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  totalCarbonSaved: { type: Number, default: 0 },
}, {
  timestamps: true
});

export const Team = model<ITeam>('Team', TeamSchema);
