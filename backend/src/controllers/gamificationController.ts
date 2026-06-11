import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Challenge } from '../models/Challenge';
import { User } from '../models/User';

export class GamificationController {
  /**
   * Get all active and upcoming community challenges
   */
  static async getChallenges(req: AuthRequest, res: Response) {
    try {
      const challenges = await Challenge.find().sort({ startDate: 1 });
      return res.json({ challenges });
    } catch (error) {
      console.error('[gamificationController.ts:getChallenges] Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve challenges.' });
    }
  }

  /**
   * Register for a community challenge
   */
  static async joinChallenge(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { challengeId } = req.body;

      if (!challengeId) {
        return res.status(400).json({ error: 'Challenge ID is required.' });
      }

      const challenge = await Challenge.findById(challengeId);
      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found.' });
      }

      // Check if already registered
      const isRegistered = req.user.challengeRegistrations.some(
        reg => reg.challengeId.toString() === challengeId
      );

      if (isRegistered) {
        return res.status(400).json({ error: 'You are already registered for this challenge.' });
      }

      req.user.challengeRegistrations.push({
        challengeId: challenge._id as any,
        progress: 0,
        joinedAt: new Date()
      });

      challenge.participantsCount += 1;
      await challenge.save();
      await req.user.save();

      return res.json({
        message: 'Successfully joined challenge!',
        challengeRegistrations: req.user.challengeRegistrations
      });
    } catch (error) {
      console.error('[gamificationController.ts:joinChallenge] Error:', error);
      return res.status(500).json({ error: 'Failed to join challenge.' });
    }
  }

  /**
   * QR Check-In to progress or complete a challenge
   */
  static async checkInChallenge(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { qrCodeData } = req.body;

      if (!qrCodeData) {
        return res.status(400).json({ error: 'QR Code payload is required.' });
      }

      const challenge = await Challenge.findOne({ qrCodeData });
      if (!challenge) {
        return res.status(404).json({ error: 'No active challenge found matching this QR code.' });
      }

      const registrationIndex = req.user.challengeRegistrations.findIndex(
        reg => reg.challengeId.toString() === challenge._id.toString()
      );

      if (registrationIndex === -1) {
        return res.status(400).json({
          error: 'You are not enrolled in this challenge. Please join it first.'
        });
      }

      const registration = req.user.challengeRegistrations[registrationIndex];
      if (registration.completedAt) {
        return res.status(400).json({ error: 'You have already completed this check-in challenge!' });
      }

      // Check-in completes the challenge (or advances it)
      registration.progress = 100;
      registration.completedAt = new Date();

      // Award XP, Points and Badge
      req.user.points += challenge.pointsReward;
      req.user.xp += challenge.xpReward;

      if (challenge.badgeReward && !req.user.badges.includes(challenge.badgeReward)) {
        req.user.badges.push(challenge.badgeReward);
      }

      // Level up check
      const nextLevelXp = req.user.level * 150;
      if (req.user.xp >= nextLevelXp) {
        req.user.level += 1;
        req.user.xp -= nextLevelXp;
        req.user.badges.push(`Level ${req.user.level} Climber 🧗‍♀️`);
      }

      await req.user.save();

      return res.json({
        message: `Check-in successful! Earned +${challenge.pointsReward} Points and +${challenge.xpReward} XP!`,
        user: {
          points: req.user.points,
          level: req.user.level,
          xp: req.user.xp,
          badges: req.user.badges
        }
      });
    } catch (error) {
      console.error('[gamificationController.ts:checkInChallenge] Error:', error);
      return res.status(500).json({ error: 'Challenge QR scan check-in failed.' });
    }
  }

  /**
   * Get user badges list
   */
  static async getBadges(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      return res.json({ badges: req.user.badges });
    } catch (error) {
      console.error('[gamificationController.ts:getBadges] Error:', error);
      return res.status(500).json({ error: 'Failed to fetch user achievement badges.' });
    }
  }
}
