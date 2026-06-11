import { Response } from 'express';
import { BillAnalysis } from '../models/BillAnalysis';
import { AuthRequest } from '../middleware/auth';
import { OcrService } from '../services/ocrService';
import { Activity } from '../models/Activity';

export class OcrController {
  /**
   * Upload and process image for OCR carbon estimation
   */
  static async uploadBillOrReceipt(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      if (!req.file) {
        return res.status(400).json({ error: 'No image or PDF file was uploaded.' });
      }

      const fileType = (req.body.fileType || 'receipt') as 'bill' | 'receipt';
      const fileName = req.file.originalname;

      // Extract details
      const parsedData = await OcrService.parseBillOrReceipt(
        req.file.buffer,
        fileName,
        fileType
      );

      // Create new analysis document
      const analysis = new BillAnalysis({
        userId: req.user._id,
        fileName,
        fileType,
        extractedText: `Extracted contents of document ${fileName}`,
        detectedItems: parsedData.detectedItems,
        totalCost: parsedData.totalCost,
        totalConsumptionKwh: parsedData.totalConsumptionKwh,
        estimatedCarbonImpact: parsedData.estimatedCarbonImpact,
        recommendations: parsedData.recommendations,
        status: 'completed'
      });

      await analysis.save();

      // If it is a bill or receipt, we can automatically log it into user activity history
      // For utility bills, let's create a carbon activity entry for that date if not exists
      const activityDate = new Date();
      activityDate.setHours(0, 0, 0, 0);

      let activity = await Activity.findOne({ userId: req.user._id, date: activityDate });
      if (!activity) {
        activity = new Activity({
          userId: req.user._id,
          date: activityDate,
          totalCarbonImpact: parsedData.estimatedCarbonImpact
        });
      } else {
        activity.totalCarbonImpact += parsedData.estimatedCarbonImpact;
      }

      if (fileType === 'bill' && parsedData.totalConsumptionKwh) {
        activity.energy.electricityKwh += parsedData.totalConsumptionKwh;
      } else {
        // distribute carbon savings/impact
        activity.shopping.onlineItems += parsedData.detectedItems.length;
      }

      await activity.save();

      return res.status(201).json({
        message: 'Document analyzed and carbon impact logged successfully.',
        analysis
      });
    } catch (error) {
      console.error('[ocrController.ts:uploadBillOrReceipt] OCR processing error:', error);
      return res.status(500).json({ error: 'Failed to process document OCR analysis.' });
    }
  }

  /**
   * Retrieve previous bill/receipt analyses
   */
  static async getAnalyses(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const analyses = await BillAnalysis.find({ userId: req.user._id }).sort({ createdAt: -1 });
      return res.json({ analyses });
    } catch (error) {
      console.error('[ocrController.ts:getAnalyses] Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve scanned document history.' });
    }
  }
}
