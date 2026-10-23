import type { Request, Response, NextFunction } from 'express';
import type { AdminRole } from '../../src/data/types';

export function requireRole(...allowedRoles: AdminRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required before accessing this module',
      });
      return;
    }

    // Super Admin has all privileges
    if (req.user.role === 'Super Admin' || allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({
      error: 'Forbidden',
      message: `Access denied. Role '${req.user.role}' lacks permissions for this administrative operation. Required roles: ${allowedRoles.join(', ')}`,
    });
  };
}
