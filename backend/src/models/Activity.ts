import { Schema, model, Document } from 'mongoose';

export interface IActivity extends Document {
  userId: Schema.Types.ObjectId;
  date: Date;
  transportation: {
    carKm: number;
    bikeKm: number;
    evKm: number;
    busKm: number;
    metroKm: number;
    flightHours: number;
  };
  energy: {
    electricityKwh: number;
    acHours: number;
    appliancesHours: number;
  };
  food: {
    dietType: 'vegetarian' | 'vegan' | 'mixed' | 'meat-heavy';
    servings: number;
  };
  shopping: {
    onlineItems: number;
    fashionItems: number;
    electronicsItems: number;
  };
  waste: {
    recyclableKg: number;
    nonRecyclableKg: number;
  };
  water: {
    liters: number;
  };
  totalCarbonImpact: number; // Stored in kg CO2
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, default: Date.now, index: true },
  transportation: {
    carKm: { type: Number, default: 0 },
    bikeKm: { type: Number, default: 0 },
    evKm: { type: Number, default: 0 },
    busKm: { type: Number, default: 0 },
    metroKm: { type: Number, default: 0 },
    flightHours: { type: Number, default: 0 },
  },
  energy: {
    electricityKwh: { type: Number, default: 0 },
    acHours: { type: Number, default: 0 },
    appliancesHours: { type: Number, default: 0 },
  },
  food: {
    dietType: { type: String, enum: ['vegetarian', 'vegan', 'mixed', 'meat-heavy'], default: 'mixed' },
    servings: { type: Number, default: 1 },
  },
  shopping: {
    onlineItems: { type: Number, default: 0 },
    fashionItems: { type: Number, default: 0 },
    electronicsItems: { type: Number, default: 0 },
  },
  waste: {
    recyclableKg: { type: Number, default: 0 },
    nonRecyclableKg: { type: Number, default: 0 },
  },
  water: {
    liters: { type: Number, default: 0 },
  },
  totalCarbonImpact: { type: Number, required: true },
}, {
  timestamps: true
});

// Ensure a user can only have one carbon log entry per day
ActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

export const Activity = model<IActivity>('Activity', ActivitySchema);
