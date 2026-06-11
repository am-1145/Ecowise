import { Schema, model, Document } from 'mongoose';

export interface IMarketplaceProduct extends Document {
  name: string;
  description: string;
  category: 'product' | 'offset';
  price: number; // in USD
  imageUrl: string;
  carbonSaved: number; // kg CO2 saved per purchase/unit
  rating: number;
  ratingCount: number;
  link?: string;
  alternatives: string[]; // List of traditional items this replaces
  provider: string; // Partner organization (e.g. "EcoPlant", "SolarNet")
  isOffset: boolean; // True if it directly offsets carbon (e.g., planting trees)
  offsetType?: 'forestry' | 'solar' | 'wind' | 'methane' | 'household';
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceProductSchema = new Schema<IMarketplaceProduct>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['product', 'offset'], required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  carbonSaved: { type: Number, required: true },
  rating: { type: Number, default: 5 },
  ratingCount: { type: Number, default: 1 },
  link: { type: String },
  alternatives: [{ type: String }],
  provider: { type: String, required: true },
  isOffset: { type: Boolean, default: false },
  offsetType: { type: String, enum: ['forestry', 'solar', 'wind', 'methane', 'household'] },
}, {
  timestamps: true
});

export const MarketplaceProduct = model<IMarketplaceProduct>('MarketplaceProduct', MarketplaceProductSchema);
