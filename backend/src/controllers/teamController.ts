import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Team } from '../models/Team';
import { User } from '../models/User';

export class TeamController {
  /**
   * Create a new team or family sustainability group
   */
  static async createTeam(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { name, type } = req.body;

      if (!name || !type || !['family', 'team'].includes(type)) {
        return res.status(400).json({ error: 'Name and valid type (family or team) are required.' });
      }

      // Check duplicate name
      const existing = await Team.findOne({ name });
      if (existing) {
        return res.status(400).json({ error: 'A team with this name already exists.' });
      }

      // Generate random invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const team = new Team({
        name,
        type,
        members: [{ userId: req.user._id, role: 'admin' }],
        inviteCode,
        totalPoints: req.user.points,
        totalCarbonSaved: 120 // start bonus
      });

      await team.save();

      // Bind team ID to user model
      if (type === 'family') {
        req.user.familyId = team._id as any;
      } else {
        req.user.teamId = team._id as any;
      }
      await req.user.save();

      return res.status(201).json({ team });
    } catch (error) {
      console.error('[teamController.ts:createTeam] Error:', error);
      return res.status(500).json({ error: 'Failed to create group account.' });
    }
  }

  /**
   * Join a team or family via Invite Code
   */
  static async joinTeam(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { inviteCode } = req.body;

      if (!inviteCode) {
        return res.status(400).json({ error: 'Invite code is required.' });
      }

      const team = await Team.findOne({ inviteCode });
      if (!team) {
        return res.status(404).json({ error: 'No team or family group found matching this invite code.' });
      }

      // Check if already in the team
      const isMember = team.members.some(
        mem => mem.userId.toString() === req.user?._id.toString()
      );

      if (isMember) {
        return res.status(400).json({ error: 'You are already a member of this group.' });
      }

      team.members.push({
        userId: req.user._id as any,
        role: 'member',
        joinedAt: new Date()
      });

      // Update team point pooling
      team.totalPoints += req.user.points;
      await team.save();

      // Bind group ID to user profile
      if (team.type === 'family') {
        req.user.familyId = team._id as any;
      } else {
        req.user.teamId = team._id as any;
      }
      await req.user.save();

      return res.json({ message: 'Successfully joined group!', team });
    } catch (error) {
      console.error('[teamController.ts:joinTeam] Error:', error);
      return res.status(500).json({ error: 'Failed to join group.' });
    }
  }

  /**
   * Retrieve group details
   */
  static async getTeamDetails(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { teamId } = req.params;

      const team = await Team.findById(teamId).populate('members.userId', 'name email points level');
      if (!team) {
        return res.status(404).json({ error: 'Group profile not found.' });
      }

      return res.json({ team });
    } catch (error) {
      console.error('[teamController.ts:getTeamDetails] Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve group statistics.' });
    }
  }

  /**
   * Retrieve all teams/families lists for competition leaderboard
   */
  static async getTeams(req: AuthRequest, res: Response) {
    try {
      const teams = await Team.find().sort({ totalPoints: -1 }).limit(20);
      return res.json({ teams });
    } catch (error) {
      console.error('[teamController.ts:getTeams] Error:', error);
      return res.status(500).json({ error: 'Failed to query competitive teams.' });
    }
  }
}
