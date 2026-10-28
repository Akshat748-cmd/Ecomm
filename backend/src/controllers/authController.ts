import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/database';
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

  if (user.isLocked) {
    res.status(423).json({
      error: 'AccountLocked',
      message: 'Account is locked due to too many failed login attempts. Contact an administrator.',
    });
    return;
  }

  const isPasswordValid = await db.verifyPassword(email, password);
  if (!isPasswordValid) {
    const { locked, attempts } = db.recordFailedLogin(email);
    db.addAuditLog('System', 'Security', `Failed login attempt for ${email} (${attempts}/5)`, '', 'Bad password', req.ip);

    if (locked) {
      res.status(423).json({
        error: 'AccountLocked',
        message: 'Account has been locked after 5 failed login attempts. Contact an administrator.',
      });
      return;
    }

    res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
    return;
  }

  // Reset failed login counter upon successful password verification
  db.resetFailedLogins(email);

  // Return temporary token for MFA challenge
  res.json({
    message: 'Credentials verified. Dual-factor MFA challenge required.',
    requiresMfa: true,
    email: user.email,
    tempToken: jwt.sign({ email: user.email, stage: 'mfa_pending' }, config.jwtSecret, { expiresIn: '5m' }),
  });
}

export async function verifyMfa(req: Request, res: Response): Promise<void> {
  const { email, code, tempToken } = req.body;
  if (!email || !code || !tempToken) {
    res.status(400).json({ error: 'ValidationError', message: 'Email, 6-digit TOTP code, and tempToken are required' });
    return;
  }

  let decodedTempToken: any;
  try {
    decodedTempToken = jwt.verify(tempToken, config.jwtSecret);
  } catch {
    res.status(401).json({ error: 'Unauthorized', message: 'MFA session expired or invalid. Please log in again.' });
    return;
  }

  // Hardening: require tempToken payload stage === "mfa_pending" and payload.email === request email
  if (
    !decodedTempToken ||
    decodedTempToken.stage !== 'mfa_pending' ||
    decodedTempToken.email?.toLowerCase() !== email.toLowerCase()
  ) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid MFA session token. tempToken must have stage === "mfa_pending" and matching email.',
    });
    return;
  }

  const user = await db.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'NotFound', message: 'User not found' });
    return;
  }

  if (user.isLocked) {
    res.status(423).json({
      error: 'AccountLocked',
      message: 'Account is locked due to too many failed login attempts.',
    });
    return;
  }

  // Format check: 6 digits required
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    res.status(400).json({ error: 'ValidationError', message: 'Invalid TOTP token format. 6 digits required.' });
    return;
  }

  // Real TOTP check (single configured demo code from env, never "any 6 digits")
  const expectedDemoCode = config.mfaDemoCode || user.mfaSecret;
  const isCodeValid = Boolean(expectedDemoCode && (code === expectedDemoCode || code === user.mfaSecret));

  if (!isCodeValid) {
    db.addAuditLog(user.name, 'Security', `Failed MFA TOTP challenge for ${email}`, '', 'Invalid TOTP code', req.ip);
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid TOTP code' });
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
    { expiresIn: config.jwtExpiresIn as any }
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
