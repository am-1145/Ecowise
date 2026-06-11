import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123456';

/**
 * Require valid JWT Token authentication middleware
 */
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Authorization header with Bearer token is missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User session not found or account deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[auth.ts:requireAuth] Token verification failed:', error);
    return res.status(401).json({ error: 'Authentication failed. Invalid or expired token.' });
  }
};

/**
 * Require Admin role middleware
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
};
