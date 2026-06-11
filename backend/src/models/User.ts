import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAccessibilitySettings {
  contrast: 'normal' | 'high' | 'colorblind';
  dyslexicFont: boolean;
  fontScale: 'small' | 'medium' | 'large' | 'xl';
  reducedMotion: boolean;
  screenReader: boolean;
  voiceNav: boolean;
}

export interface IChallengeRegistration {
  challengeId: Schema.Types.ObjectId;
  progress: number;
  joinedAt: Date;
  completedAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  firebaseUid?: string;
  role: 'user' | 'admin';
  points: number;
  level: number;
  xp: number;
  streak: number;
  streakUpdatedAt?: Date;
  lastActiveDate?: Date;
  badges: string[];
  challengeRegistrations: IChallengeRegistration[];
  teamId?: Schema.Types.ObjectId;
  familyId?: Schema.Types.ObjectId;
  accessibilitySettings: IAccessibilitySettings;
  comparePassword(password: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const AccessibilitySettingsSchema = new Schema<IAccessibilitySettings>({
  contrast: { type: String, enum: ['normal', 'high', 'colorblind'], default: 'normal' },
  dyslexicFont: { type: Boolean, default: false },
  fontScale: { type: String, enum: ['small', 'medium', 'large', 'xl'], default: 'medium' },
  reducedMotion: { type: Boolean, default: false },
  screenReader: { type: Boolean, default: false },
  voiceNav: { type: Boolean, default: false },
}, { _id: false });

const ChallengeRegistrationSchema = new Schema<IChallengeRegistration>({
  challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
  progress: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
}, { _id: false });

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  firebaseUid: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  streakUpdatedAt: { type: Date },
  lastActiveDate: { type: Date },
  badges: [{ type: String }],
  challengeRegistrations: [ChallengeRegistrationSchema],
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  familyId: { type: Schema.Types.ObjectId, ref: 'Team' },
  accessibilitySettings: {
    type: AccessibilitySettingsSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

export const User = model<IUser>('User', UserSchema);
