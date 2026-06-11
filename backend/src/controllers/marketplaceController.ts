import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MarketplaceProduct } from '../models/MarketplaceProduct';
import { OffsetTransaction } from '../models/OffsetTransaction';
import { User } from '../models/User';

export class MarketplaceController {
  /**
   * Get all sustainable products and offsets
   */
  static async getProducts(req: AuthRequest, res: Response) {
    try {
      const products = await MarketplaceProduct.find().sort({ rating: -1 });
      return res.json({ products });
    } catch (error) {
      console.error('[marketplaceController.ts:getProducts] Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve products.' });
    }
  }

  /**
   * Purchase carbon offset credits
   */
  static async buyOffset(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { productId, amountPaid } = req.body;

      if (!productId || !amountPaid) {
        return res.status(400).json({ error: 'Product ID and amount paid are required.' });
      }

      const product = await MarketplaceProduct.findById(productId);
      if (!product || !product.isOffset) {
        return res.status(404).json({ error: 'Carbon offset project not found.' });
      }

      // Calculate carbon offset in kg: e.g. 1 USD offsets 100 kg CO2
      const carbonOffsetKg = Math.round(amountPaid * 100);

      const transaction = new OffsetTransaction({
        userId: req.user._id,
        productId: product._id,
        amountPaid: Number(amountPaid),
        carbonOffsetKg,
        projectName: product.name,
        provider: product.provider,
        status: 'completed',
        certificateUrl: `https://ecowise.ai/certificates/cert_${Math.random().toString(36).substring(7)}.pdf`
      });

      await transaction.save();

      // Update User points & badge
      const user = await User.findById(req.user._id);
      if (user) {
        user.points += Math.round(amountPaid * 10); // 10 points per dollar spent
        user.xp += Math.round(amountPaid * 8);

        if (!user.badges.includes('Carbon Neutralizer 🌳')) {
          user.badges.push('Carbon Neutralizer 🌳');
        }
        await user.save();
      }

      return res.status(201).json({
        message: 'Offset purchase successfully completed.',
        transaction,
        userPoints: user?.points
      });
    } catch (error) {
      console.error('[marketplaceController.ts:buyOffset] Error:', error);
      return res.status(500).json({ error: 'Failed to complete offset purchase transaction.' });
    }
  }

  /**
   * Get purchase history of offsets
   */
  static async getTransactions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const transactions = await OffsetTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
      return res.json({ transactions });
    } catch (error) {
      console.error('[marketplaceController.ts:getTransactions] Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve offset transaction ledger.' });
    }
  }
}
