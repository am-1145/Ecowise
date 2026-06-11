import { Response } from 'express';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { Goal } from '../models/Goal';
import { AuthRequest } from '../middleware/auth';
import { GeminiService } from '../services/geminiService';

export class CarbonController {
  // Constants for CO2 factors in kg CO2 per unit
  private static readonly COEFFS = {
    car: 0.18,      // per km
    bike: 0,        // per km
    ev: 0.05,       // per km
    bus: 0.06,      // per km
    metro: 0.03,    // per km
    flight: 90.0,   // per flight hour

    electricity: 0.45, // per KWh
    ac: 0.9,           // per hour
    appliances: 0.2,   // per hour

    vegetarian: 1.5,   // per serving
    vegan: 0.9,        // per serving
    mixed: 3.2,        // per serving
    meatHeavy: 6.5,    // per serving

    onlineItem: 0.8,   // per item
    fashionItem: 12.0, // per item
    electronicsItem: 45.0, // per item

    recyclable: 0.05,  // per kg
    nonRecyclable: 0.95, // per kg

    water: 0.002       // per liter
  };

  /**
   * Log daily sustainability metrics and calculate carbon footprint
   */
  static async logActivity(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const userId = req.user._id;
      const {
        date,
        transportation = {},
        energy = {},
        food = {},
        shopping = {},
        waste = {},
        water = {}
      } = req.body;

      // Extract values
      const t = {
        carKm: Number(transportation.carKm || 0),
        bikeKm: Number(transportation.bikeKm || 0),
        evKm: Number(transportation.evKm || 0),
        busKm: Number(transportation.busKm || 0),
        metroKm: Number(transportation.metroKm || 0),
        flightHours: Number(transportation.flightHours || 0)
      };

      const e = {
        electricityKwh: Number(energy.electricityKwh || 0),
        acHours: Number(energy.acHours || 0),
        appliancesHours: Number(energy.appliancesHours || 0)
      };

      const f = {
        dietType: food.dietType || 'mixed',
        servings: Number(food.servings || 1)
      };

      const s = {
        onlineItems: Number(shopping.onlineItems || 0),
        fashionItems: Number(shopping.fashionItems || 0),
        electronicsItems: Number(shopping.electronicsItems || 0)
      };

      const w = {
        recyclableKg: Number(waste.recyclableKg || 0),
        nonRecyclableKg: Number(waste.nonRecyclableKg || 0)
      };

      const wt = {
        liters: Number(water.liters || 0)
      };

      // Calculate Carbon Impact (kg CO2)
      let carbon = 0;
      // Transit
      carbon += t.carKm * CarbonController.COEFFS.car;
      carbon += t.evKm * CarbonController.COEFFS.ev;
      carbon += t.busKm * CarbonController.COEFFS.bus;
      carbon += t.metroKm * CarbonController.COEFFS.metro;
      carbon += t.flightHours * CarbonController.COEFFS.flight;

      // Energy
      carbon += e.electricityKwh * CarbonController.COEFFS.electricity;
      carbon += e.acHours * CarbonController.COEFFS.ac;
      carbon += e.appliancesHours * CarbonController.COEFFS.appliances;

      // Diet
      const dietFactor = f.dietType === 'vegan' ? CarbonController.COEFFS.vegan :
                         f.dietType === 'vegetarian' ? CarbonController.COEFFS.vegetarian :
                         f.dietType === 'meat-heavy' ? CarbonController.COEFFS.meatHeavy :
                         CarbonController.COEFFS.mixed;
      carbon += f.servings * dietFactor;

      // Consumer Goods
      carbon += s.onlineItems * CarbonController.COEFFS.onlineItem;
      carbon += s.fashionItems * CarbonController.COEFFS.fashionItem;
      carbon += s.electronicsItems * CarbonController.COEFFS.electronicsItem;

      // Waste
      carbon += w.recyclableKg * CarbonController.COEFFS.recyclable;
      carbon += w.nonRecyclableKg * CarbonController.COEFFS.nonRecyclable;

      // Water
      carbon += wt.liters * CarbonController.COEFFS.water;

      carbon = Math.round(carbon * 100) / 100;

      // Find if entry already exists for this date
      const logDate = date ? new Date(date) : new Date();
      logDate.setHours(0, 0, 0, 0);

      let activity = await Activity.findOne({ userId, date: logDate });
      let previousImpact = 0;

      if (activity) {
        previousImpact = activity.totalCarbonImpact;
        activity.transportation = t;
        activity.energy = e;
        activity.food = f;
        activity.shopping = s;
        activity.waste = w;
        activity.water = wt;
        activity.totalCarbonImpact = carbon;
      } else {
        activity = new Activity({
          userId,
          date: logDate,
          transportation: t,
          energy: e,
          food: f,
          shopping: s,
          waste: w,
          water: wt,
          totalCarbonImpact: carbon
        });
      }

      await activity.save();

      // Update Gamification stats: 15 XP for logging carbon
      const user = await User.findById(userId);
      if (user) {
        user.xp += 20;
        user.points += 5;
        // Level up check
        const nextLevelXp = user.level * 150;
        if (user.xp >= nextLevelXp) {
          user.level += 1;
          user.xp -= nextLevelXp;
          user.badges.push(`Level ${user.level} Climber 🧗‍♀️`);
        }
        await user.save();
      }

      // Update goal progression if user has active goals matching this category
      const activeGoals = await Goal.find({ userId, status: 'active' });
      for (const goal of activeGoals) {
        // Simple update: let's track cumulative carbon saved compared to previous logs or baseline
        // For testing, let's decrement goal currentValue if they reduce carbon below a threshold
        if (goal.category === 'general' || activity.totalCarbonImpact < 20) {
          // Increment progress towards target
          goal.currentValue += Math.max(0, 5); // Mock reduction step
          if (goal.currentValue >= goal.targetValue) {
            goal.status = 'achieved';
            // Award points
            if (user) {
              user.points += 200;
              user.xp += 100;
              user.badges.push(`Goal Crusher: ${goal.title} 🏆`);
              await user.save();
            }
          }
          await goal.save();
        }
      }

      return res.json({
        message: 'Sustainability activity logged successfully.',
        activity,
        gamification: {
          points: user?.points,
          level: user?.level,
          xp: user?.xp,
          badges: user?.badges
        }
      });
    } catch (error) {
      console.error('[carbonController.ts:logActivity] Error:', error);
      return res.status(500).json({ error: 'Failed to record daily carbon activity.' });
    }
  }

  /**
   * Get log history
   */
  static async getHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { start, end, category } = req.query;

      const filter: any = { userId: req.user._id };
      if (start || end) {
        filter.date = {};
        if (start) filter.date.$gte = new Date(start as string);
        if (end) filter.date.$lte = new Date(end as string);
      }

      const activities = await Activity.find(filter).sort({ date: -1 });
      return res.json({ activities });
    } catch (error) {
      console.error('[carbonController.ts:getHistory] Error:', error);
      return res.status(500).json({ error: 'Failed to fetch carbon history logs.' });
    }
  }

  /**
   * Get dashboard metrics & calculations
   */
  static async getStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const userId = req.user._id;

      const activities = await Activity.find({ userId }).sort({ date: -1 });

      const count = activities.length;
      if (count === 0) {
        return res.json({
          score: 80, // welcome default
          grade: 'B+',
          co2Saved: 0,
          averages: { transportation: 0, energy: 0, food: 0, shopping: 0, waste: 0, water: 0, total: 0 },
          annualProjection: 0
        });
      }

      const sums = { transportation: 0, energy: 0, food: 0, shopping: 0, waste: 0, water: 0, total: 0 };

      activities.forEach(act => {
        // Calculate category breakdowns
        let transit = act.transportation.carKm * CarbonController.COEFFS.car +
                      act.transportation.evKm * CarbonController.COEFFS.ev +
                      act.transportation.busKm * CarbonController.COEFFS.bus +
                      act.transportation.metroKm * CarbonController.COEFFS.metro +
                      act.transportation.flightHours * CarbonController.COEFFS.flight;

        let power = act.energy.electricityKwh * CarbonController.COEFFS.electricity +
                    act.energy.acHours * CarbonController.COEFFS.ac +
                    act.energy.appliancesHours * CarbonController.COEFFS.appliances;

        let dietFactor = act.food.dietType === 'vegan' ? CarbonController.COEFFS.vegan :
                         act.food.dietType === 'vegetarian' ? CarbonController.COEFFS.vegetarian :
                         act.food.dietType === 'meat-heavy' ? CarbonController.COEFFS.meatHeavy :
                         CarbonController.COEFFS.mixed;
        let diet = act.food.servings * dietFactor;

        let shop = act.shopping.onlineItems * CarbonController.COEFFS.onlineItem +
                   act.shopping.fashionItems * CarbonController.COEFFS.fashionItem +
                   act.shopping.electronicsItems * CarbonController.COEFFS.electronicsItem;

        let waste = act.waste.recyclableKg * CarbonController.COEFFS.recyclable +
                    act.waste.nonRecyclableKg * CarbonController.COEFFS.nonRecyclable;

        let water = act.water.liters * CarbonController.COEFFS.water;

        sums.transportation += transit;
        sums.energy += power;
        sums.food += diet;
        sums.shopping += shop;
        sums.waste += waste;
        sums.water += water;
        sums.total += act.totalCarbonImpact;
      });

      // Calculate averages (per day logged)
      const averages = {
        transportation: Math.round((sums.transportation / count) * 100) / 100,
        energy: Math.round((sums.energy / count) * 100) / 100,
        food: Math.round((sums.food / count) * 100) / 100,
        shopping: Math.round((sums.shopping / count) * 100) / 100,
        waste: Math.round((sums.waste / count) * 100) / 100,
        water: Math.round((sums.water / count) * 100) / 100,
        total: Math.round((sums.total / count) * 100) / 100
      };

      // Annual projection (based on daily average * 365)
      const annualProjection = Math.round(averages.total * 365);

      // Score logic: ideal annual footprint is 2000kg (2 tonnes).
      // Global average is ~4800kg. US average is ~16000kg.
      // Score = 100 if projection <= 1500kg. Drop score as footprint rises.
      let score = 100 - Math.round((annualProjection - 1500) / 100);
      score = Math.max(15, Math.min(100, score));

      let grade = 'A+';
      if (score < 40) grade = 'F';
      else if (score < 50) grade = 'D';
      else if (score < 60) grade = 'C';
      else if (score < 75) grade = 'B';
      else if (score < 90) grade = 'A';

      // CO2 Saved (assume baseline of 15 kg CO2 per day as global baseline, compare against daily avg)
      const co2Saved = Math.max(0, Math.round((15 - averages.total) * count * 100) / 100);

      return res.json({
        score,
        grade,
        co2Saved,
        averages,
        annualProjection,
        totalLogs: count
      });
    } catch (error) {
      console.error('[carbonController.ts:getStats] Error:', error);
      return res.status(500).json({ error: 'Failed to compile carbon statistics.' });
    }
  }

  /**
   * Carbon footprint prediction modeling (weekly, monthly, annual forecasting)
   */
  static async getPredictions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const userId = req.user._id;

      const logs = await Activity.find({ userId }).sort({ date: 1 });
      let baseFootprint = 12.5; // default daily kg CO2 baseline if few logs

      if (logs.length > 0) {
        const total = logs.reduce((sum, l) => sum + l.totalCarbonImpact, 0);
        baseFootprint = total / logs.length;
      }

      // Generate timeseries for next 7 days, next 4 weeks, and next 12 months
      // Showing Best Case (-20% target habits), Average Case (baseline), Worst Case (+15% rising energy usage)
      const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
      const dailyPredictions = days.map((d, index) => {
        const factor = 1 + (Math.sin(index) * 0.05); // slight wave variance
        return {
          label: d,
          average: Math.round(baseFootprint * factor * 100) / 100,
          best: Math.round(baseFootprint * 0.8 * factor * 100) / 100,
          worst: Math.round(baseFootprint * 1.15 * factor * 100) / 100
        };
      });

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      // Start monthly projections
      const monthlyPredictions = months.map((m, index) => {
        const seasonalFactor = 1 + (Math.sin((index / 12) * Math.PI * 2) * 0.15); // seasonal cooling/heating
        return {
          label: m,
          average: Math.round(baseFootprint * 30 * seasonalFactor * 100) / 100,
          best: Math.round(baseFootprint * 30 * 0.78 * seasonalFactor * 100) / 100,
          worst: Math.round(baseFootprint * 30 * 1.12 * seasonalFactor * 100) / 100
        };
      });

      return res.json({
        daily: dailyPredictions,
        monthly: monthlyPredictions,
        annualForecast: {
          average: Math.round(baseFootprint * 365),
          best: Math.round(baseFootprint * 365 * 0.78),
          worst: Math.round(baseFootprint * 365 * 1.12)
        }
      });
    } catch (error) {
      console.error('[carbonController.ts:getPredictions] Error:', error);
      return res.status(500).json({ error: 'Failed to compile carbon projections.' });
    }
  }

  /**
   * Call AI to generate a custom weekly sustainability action plan
   */
  static async getWeeklyActionPlan(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const userId = req.user._id;

      // Get stats first to feed to Gemini
      const logs = await Activity.find({ userId }).sort({ date: -1 }).limit(10);
      const sums = { transportation: 0, energy: 0, food: 0, shopping: 0, waste: 0, water: 0, total: 0 };
      const count = logs.length || 1;

      logs.forEach(act => {
        sums.total += act.totalCarbonImpact;
        // Mock division for categories
        sums.transportation += act.totalCarbonImpact * 0.35;
        sums.energy += act.totalCarbonImpact * 0.3;
        sums.food += act.totalCarbonImpact * 0.2;
        sums.shopping += act.totalCarbonImpact * 0.1;
        sums.waste += act.totalCarbonImpact * 0.04;
        sums.water += act.totalCarbonImpact * 0.01;
      });

      const stats = {
        transportation: Math.round(sums.transportation / count),
        energy: Math.round(sums.energy / count),
        food: Math.round(sums.food / count),
        shopping: Math.round(sums.shopping / count),
        waste: Math.round(sums.waste / count),
        water: Math.round(sums.water / count),
        total: Math.round(sums.total / count)
      };

      const planJson = await GeminiService.generateWeeklyPlan(stats);
      return res.json({ plan: JSON.parse(planJson) });
    } catch (error) {
      console.error('[carbonController.ts:getWeeklyActionPlan] Error:', error);
      return res.status(500).json({ error: 'Failed to generate custom weekly action plan.' });
    }
  }
}
