import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Journal } from '../models/Journal';

export class JournalController {
  /**
   * Log daily sustainability journal entry
   */
  static async logJournal(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { mood, entryText, carbonScoreRating, activities = [] } = req.body;

      if (!mood || !entryText || !carbonScoreRating) {
        return res.status(400).json({ error: 'Mood, entryText, and carbonScoreRating are required.' });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if entry already exists
      let journal = await Journal.findOne({ userId: req.user._id, date: today });
      if (journal) {
        journal.mood = Number(mood);
        journal.entryText = entryText;
        journal.carbonScoreRating = Number(carbonScoreRating);
        journal.activities = activities;
      } else {
        journal = new Journal({
          userId: req.user._id,
          date: today,
          mood: Number(mood),
          entryText,
          carbonScoreRating: Number(carbonScoreRating),
          activities
        });
      }

      await journal.save();
      return res.json({ message: 'Journal entry successfully saved.', journal });
    } catch (error) {
      console.error('[journalController.ts:logJournal] Error:', error);
      return res.status(500).json({ error: 'Failed to record journal entry.' });
    }
  }

  /**
   * Fetch journal history
   */
  static async getJournals(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const journals = await Journal.find({ userId: req.user._id }).sort({ date: -1 });
      return res.json({ journals });
    } catch (error) {
      console.error('[journalController.ts:getJournals] Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve journal history.' });
    }
  }

  /**
   * Calculate Mood vs Sustainability Correlation Metrics
   */
  static async getMoodCorrelation(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const journals = await Journal.find({ userId: req.user._id });

      if (journals.length < 2) {
        return res.json({
          hasData: false,
          message: 'Please complete at least 2 daily sustainability journal entries to analyze correlations.',
          avgMoodHighEco: 0,
          avgMoodLowEco: 0,
          correlationPercentage: 0
        });
      }

      // Filter high-sustainability behaviors vs low
      const highEco = journals.filter(j => j.carbonScoreRating >= 7);
      const lowEco = journals.filter(j => j.carbonScoreRating < 7);

      const avgMoodHigh = highEco.length > 0
        ? highEco.reduce((sum, j) => sum + j.mood, 0) / highEco.length
        : 0;

      const avgMoodLow = lowEco.length > 0
        ? lowEco.reduce((sum, j) => sum + j.mood, 0) / lowEco.length
        : 0;

      // Positive shift assessment
      const diff = avgMoodHigh - avgMoodLow;
      const correlationPercentage = diff > 0 ? Math.min(100, Math.round((diff / 10) * 100)) : 0;

      return res.json({
        hasData: true,
        totalEntries: journals.length,
        avgMoodHighEco: Math.round(avgMoodHigh * 10) / 10,
        avgMoodLowEco: Math.round(avgMoodLow * 10) / 10,
        correlationPercentage,
        recommendation: diff > 0
          ? `Your logs indicate that green activities increase your daily happiness score by ${Math.round(diff * 10)}%! Keep it up.`
          : 'Sustainable choices help build a mindful lifestyle. Focus on simple daily habits to observe personal growth.'
      });
    } catch (error) {
      console.error('[journalController.ts:getMoodCorrelation] Error:', error);
      return res.status(500).json({ error: 'Failed to compute mood-habit analytics.' });
    }
  }
}
