import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123456';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: AuthRequest, res: Response) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required fields.' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email address already exists.' });
      }

      const user = new User({
        name,
        email,
        password,
        role: 'user',
        points: 100, // 100 welcome points!
        xp: 50,
        level: 1,
        streak: 0,
        badges: ['Welcome Greenhorn 🌿']
      });

      await user.save();

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
          badges: user.badges,
          accessibilitySettings: user.accessibilitySettings
        }
      });
    } catch (error) {
      console.error('[authController.ts:register] Registration error:', error);
      return res.status(500).json({ error: 'Failed to complete user registration.' });
    }
  }

  /**
   * Login user
   */
  static async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required fields.' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password credentials.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password credentials.' });
      }

      // Check and update login streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (user.lastActiveDate) {
        const lastActive = new Date(user.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - lastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          user.streak += 1;
          user.points += 10; // 10 points for streak maintenance
          user.xp += 15;
          user.streakUpdatedAt = new Date();

          // Award badge on streak milestones
          if (user.streak === 7 && !user.badges.includes('Weekly Warrior 🔥')) {
            user.badges.push('Weekly Warrior 🔥');
          }
        } else if (diffDays > 1) {
          user.streak = 1; // reset streak
        }
      } else {
        user.streak = 1;
      }

      user.lastActiveDate = new Date();
      await user.save();

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
          badges: user.badges,
          accessibilitySettings: user.accessibilitySettings
        }
      });
    } catch (error) {
      console.error('[authController.ts:login] Login error:', error);
      return res.status(500).json({ error: 'Failed to complete user login.' });
    }
  }

  /**
   * Get authenticated user profile
   */
  static async getProfile(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized profile request.' });
    }
    return res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        points: req.user.points,
        level: req.user.level,
        xp: req.user.xp,
        streak: req.user.streak,
        badges: req.user.badges,
        teamId: req.user.teamId,
        familyId: req.user.familyId,
        accessibilitySettings: req.user.accessibilitySettings
      }
    });
  }

  /**
   * Update accessibility parameters
   */
  static async updateAccessibility(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });

      const settings = req.body;
      req.user.accessibilitySettings = {
        ...req.user.accessibilitySettings,
        ...settings
      };

      await req.user.save();
      return res.json({ accessibilitySettings: req.user.accessibilitySettings });
    } catch (error) {
      console.error('[authController.ts:updateAccessibility] Error:', error);
      return res.status(500).json({ error: 'Failed to update accessibility configuration.' });
    }
  }

  /**
   * Retrieve Global Gamification Leaderboard
   */
  static async getLeaderboard(req: AuthRequest, res: Response) {
    try {
      const users = await User.find()
        .sort({ points: -1 })
        .limit(10)
        .select('name points level badges');
      return res.json({ leaderboard: users });
    } catch (error) {
      console.error('[authController.ts:getLeaderboard] Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve leaderboard statistics.' });
    }
  }
}
