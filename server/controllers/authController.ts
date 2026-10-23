import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';
import { config } from '../config';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'ValidationError', message: 'Email and password are required' });
    return;
  }

  const user = await db.getUserByEmail(email);
  if (!user || !user.isActive) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials or account deactivated' });
    return;
  }

  const isPasswordValid = await db.verifyPassword(email, password);
  if (!isPasswordValid) {
    db.addAuditLog('System', 'Security', `Failed login attempt for ${email}`, '', 'Bad password', req.ip);
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
    return;
  }

  // If MFA enabled, return temporary token for MFA step
  res.json({
    message: 'Credentials verified. Dual-factor MFA challenge required.',
    requiresMfa: true,
    email: user.email,
    tempToken: jwt.sign({ email: user.email, stage: 'mfa_pending' }, config.jwtSecret, { expiresIn: '5m' }),
  });
}

export async function verifyMfa(req: Request, res: Response): Promise<void> {
  const { email, code, tempToken } = req.body;
  if (!email || !code) {
    res.status(400).json({ error: 'ValidationError', message: 'Email and 6-digit TOTP code are required' });
    return;
  }

  try {
    jwt.verify(tempToken, config.jwtSecret);
  } catch {
    res.status(401).json({ error: 'Unauthorized', message: 'MFA session expired. Please log in again.' });
    return;
  }

  const user = await db.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'NotFound', message: 'User not found' });
    return;
  }

  // Verify 6-digit TOTP
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    res.status(400).json({ error: 'ValidationError', message: 'Invalid TOTP token format. 6 digits required.' });
    return;
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  db.addAuditLog(user.name, 'Security', `Officer Authenticated with Dual-Factor MFA (${user.role})`, '', 'Session Issued', req.ip);

  res.json({
    message: 'MFA verified. Session token established.',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json({ user: req.user });
}
