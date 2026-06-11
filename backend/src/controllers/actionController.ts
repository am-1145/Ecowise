import { Response } from 'express';
import { ActionItem } from '../models/ActionItem';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export class ActionController {
  /**
   * Get all actions for a user
   */
  static async getActions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const actions = await ActionItem.find({ userId: req.user._id }).sort({ createdAt: -1 });

      // If user has no action items, pre-populate with some default startup recommendations
      if (actions.length === 0) {
        const defaults = [
          {
            userId: req.user._id,
            title: 'Transition to LED Bulbs',
            description: 'Replace 5 traditional incandescent light bulbs with energy-efficient LED bulbs.',
            category: 'energy',
            impact: 'medium',
            difficulty: 'easy',
            estimatedSavings: 120, // kg CO2/year
            timeRequired: '1 hour',
            status: 'planned',
            isCustom: false
          },
          {
            userId: req.user._id,
            title: 'Use Public Transport',
            description: 'Replace daily solo driving commute with bus or metro transit twice a week.',
            category: 'transportation',
            impact: 'high',
            difficulty: 'medium',
            estimatedSavings: 340,
            timeRequired: '2 days/week',
            status: 'planned',
            isCustom: false
          },
          {
            userId: req.user._id,
            title: 'Install Aerated Faucets',
            description: 'Equip kitchen and bathroom faucets with aerators to limit water flow while maintaining high pressure.',
            category: 'water',
            impact: 'low',
            difficulty: 'easy',
            estimatedSavings: 30,
            timeRequired: '30 mins',
            status: 'planned',
            isCustom: false
          }
        ];
        const newActions = await ActionItem.insertMany(defaults);
        return res.json({ actions: newActions });
      }

      return res.json({ actions });
    } catch (error) {
      console.error('[actionController.ts:getActions] Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve actions.' });
    }
  }

  /**
   * Create custom action item
   */
  static async createAction(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { title, description, category, impact, difficulty, estimatedSavings, timeRequired } = req.body;

      if (!title || !description || !category || !impact || !difficulty || !estimatedSavings || !timeRequired) {
        return res.status(400).json({ error: 'All action item fields are required.' });
      }

      const action = new ActionItem({
        userId: req.user._id,
        title,
        description,
        category,
        impact,
        difficulty,
        estimatedSavings: Number(estimatedSavings),
        timeRequired,
        status: 'planned',
        isCustom: true
      });

      await action.save();
      return res.status(201).json({ action });
    } catch (error) {
      console.error('[actionController.ts:createAction] Error:', error);
      return res.status(500).json({ error: 'Failed to create action.' });
    }
  }

  /**
   * Update action status (planned, active, completed)
   */
  static async updateActionStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { actionId } = req.params;
      const { status } = req.body;

      if (!['planned', 'active', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
      }

      const action = await ActionItem.findOne({ _id: actionId, userId: req.user._id });
      if (!action) {
        return res.status(404).json({ error: 'Action item not found.' });
      }

      const previousStatus = action.status;
      action.status = status;
      await action.save();

      // Award gamification points and XP upon completion
      let pointsAwarded = 0;
      let xpAwarded = 0;

      if (status === 'completed' && previousStatus !== 'completed') {
        const user = await User.findById(req.user._id);
        if (user) {
          // Adjust reward based on difficulty
          const difficultyMultiplier = action.difficulty === 'hard' ? 300 : action.difficulty === 'medium' ? 150 : 75;
          pointsAwarded = difficultyMultiplier;
          xpAwarded = Math.round(difficultyMultiplier * 0.8);

          user.points += pointsAwarded;
          user.xp += xpAwarded;

          // Level up check
          const nextLevelXp = user.level * 150;
          if (user.xp >= nextLevelXp) {
            user.level += 1;
            user.xp -= nextLevelXp;
            user.badges.push(`Level ${user.level} Green Master 🎓`);
          }

          if (!user.badges.includes('Eco Achiever 🏅')) {
            user.badges.push('Eco Achiever 🏅');
          }
          await user.save();
        }
      }

      return res.json({
        action,
        rewards: {
          points: pointsAwarded,
          xp: xpAwarded
        }
      });
    } catch (error) {
      console.error('[actionController.ts:updateActionStatus] Error:', error);
      return res.status(500).json({ error: 'Failed to update action status.' });
    }
  }
}
