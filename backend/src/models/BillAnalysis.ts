import { Schema, model, Document } from 'mongoose';

export interface IBillAnalysis extends Document {
  userId: Schema.Types.ObjectId;
  fileName: string;
  fileType: 'bill' | 'receipt';
  extractedText?: string;
  detectedItems: {
    name: string;
    category: string;
    cost: number;
    estimatedCo2: number;
  }[];
  totalCost: number;
  totalConsumptionKwh?: number; // Specific for electric bills
  estimatedCarbonImpact: number; // in kg CO2
  comparisonStatus?: string; // e.g. "12% higher than average"
  recommendations: string[];
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const BillAnalysisSchema = new Schema<IBillAnalysis>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileName: { type: String, required: true },
  fileType: { type: String, enum: ['bill', 'receipt'], required: true },
  extractedText: { type: String },
  detectedItems: [{
    name: { type: String, required: true },
    category: { type: String, required: true },
    cost: { type: Number, required: true },
    estimatedCo2: { type: Number, required: true },
  }],
  totalCost: { type: Number, required: true },
  totalConsumptionKwh: { type: Number },
  estimatedCarbonImpact: { type: Number, required: true },
  comparisonStatus: { type: String },
  recommendations: [{ type: String }],
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
}, {
  timestamps: true
});

export const BillAnalysis = model<IBillAnalysis>('BillAnalysis', BillAnalysisSchema);
