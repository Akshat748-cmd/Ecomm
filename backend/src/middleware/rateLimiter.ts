import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipAttempts = new Map<string, RateLimitEntry>();

export function createLoginRateLimiter(maxAttempts = 10, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.ip || req.socket.remoteAddress || '127.0.0.1').toString();
    const now = Date.now();
    const entry = ipAttempts.get(ip);

    if (!entry || now > entry.resetAt) {
      ipAttempts.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > maxAttempts) {
      res.status(429).json({
        error: 'TooManyRequests',
        message: 'Too many login attempts from this IP address. Please try again later.',
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
      return;
    }

    next();
  };
}

export function resetLoginRateLimiter(): void {
  ipAttempts.clear();
}
