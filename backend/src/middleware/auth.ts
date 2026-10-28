import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { AdminRole } from '../types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticateJwt(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token missing or invalid format',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    // Hardening rule: A pre-MFA token must NEVER be accepted by authenticateJwt
    if (decoded && decoded.stage) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Pre-MFA token cannot be used for authenticated endpoints. Complete MFA verification.',
      });
      return;
    }

    req.user = decoded as AuthenticatedUser;
    next();
  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Session token has expired or is invalid. Please re-authenticate.',
    });
  }
}

export function optionalAuthenticateJwt(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      if (decoded && !decoded.stage) {
        req.user = decoded as AuthenticatedUser;
      }
    } catch {
      // Ignore optional auth failure
    }
  }
  next();
}
