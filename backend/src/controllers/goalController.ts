import { Response } from 'express';
import { Goal } from '../models/Goal';
import { AuthRequest } from '../middleware/auth';

export class GoalController {
  /**
   * Retrieve all goals for a user
   */
  static async getGoals(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
      return res.json({ goals });
    } catch (error) {
      console.error('[goalController.ts:getGoals] Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve goals.' });
    }
  }

  /**
   * Create a new carbon reduction goal
   */
  static async createGoal(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { title, description, category, targetValue, deadline } = req.body;

      if (!title || !category || !targetValue || !deadline) {
        return res.status(400).json({ error: 'Title, category, targetValue, and deadline are required.' });
      }

      // Generate milestones: e.g. 25%, 50%, 75% progress
      const milestones = [
        { label: 'Quarter-way Progress', targetValue: Math.round(targetValue * 0.25), achieved: false },
        { label: 'Half-way Milestone', targetValue: Math.round(targetValue * 0.50), achieved: false },
        { label: 'Three-quarter Milestone', targetValue: Math.round(targetValue * 0.75), achieved: false },
        { label: 'Goal Fulfilled!', targetValue: targetValue, achieved: false }
      ];

      const goal = new Goal({
        userId: req.user._id,
        title,
        description,
        category,
        targetValue,
        currentValue: 0,
        status: 'active',
        deadline: new Date(deadline),
        milestones
      });

      await goal.save();
      return res.status(201).json({ goal });
    } catch (error) {
      console.error('[goalController.ts:createGoal] Error:', error);
      return res.status(500).json({ error: 'Failed to create goal.' });
    }
  }

  /**
   * Update goal progress manually or automatically
   */
  static async updateGoal(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { goalId } = req.params;
      const { currentValue } = req.body;

      const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
      if (!goal) {
        return res.status(404).json({ error: 'Goal not found.' });
      }

      goal.currentValue = Number(currentValue);

      // Check milestones
      goal.milestones.forEach((milestone) => {
        if (!milestone.achieved && goal.currentValue >= milestone.targetValue) {
          milestone.achieved = true;
          milestone.achievedAt = new Date();
        }
      });

      if (goal.currentValue >= goal.targetValue) {
        goal.status = 'achieved';
      }

      await goal.save();
      return res.json({ goal });
    } catch (error) {
      console.error('[goalController.ts:updateGoal] Error:', error);
      return res.status(500).json({ error: 'Failed to update goal progress.' });
    }
  }

  /**
   * Forecast carbon reductions based on active goals
   */
  static async getForecast(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const goals = await Goal.find({ userId: req.user._id, status: 'active' });

      // Calculate total potential CO2 savings from active goals
      let estimatedMonthlySavings = 0;
      goals.forEach(g => {
        if (g.category === 'transportation') estimatedMonthlySavings += 45;
        else if (g.category === 'energy') estimatedMonthlySavings += 60;
        else if (g.category === 'food') estimatedMonthlySavings += 20;
        else estimatedMonthlySavings += 15;
      });

      return res.json({
        activeGoalsCount: goals.length,
        estimatedMonthlySavingsKg: estimatedMonthlySavings,
        estimatedAnnualSavingsKg: estimatedMonthlySavings * 12,
        forecastingGradeImprovement: goals.length > 2 ? '1 Grade Higher (e.g. B to A)' : 'Stay Constant'
      });
    } catch (error) {
      console.error('[goalController.ts:getForecast] Error:', error);
      return res.status(500).json({ error: 'Failed to generate goal forecasting.' });
    }
  }
}
