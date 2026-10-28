import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  console.error(`[API Error] ${req.method} ${req.url}:`, err);

  if (err.message && err.message.includes('not allowed by CORS')) {
    res.status(403).json({
      error: 'CorsForbidden',
      message: err.message,
    });
    return;
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: err.name || 'ServerError',
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
