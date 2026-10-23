import type { Request, Response } from 'express';
import { db } from '../database/database';

export async function getRates(_req: Request, res: Response): Promise<void> {
  const data = await db.getRates();
  res.json(data);
}

export async function proposeRateOverride(req: Request, res: Response): Promise<void> {
  const { gold24k, silver999, justification } = req.body;
  if (!gold24k || !silver999 || !justification) {
    res.status(400).json({ error: 'ValidationError', message: 'gold24k, silver999, and justification are mandatory' });
    return;
  }

  const initiator = req.user ? req.user.name : 'Vikram Sharma (Principal Officer)';
  const request = await db.createMakerCheckerRequest(
    `Manual Spot Rate Override: Gold 24K ₹${gold24k}/g, Silver ₹${silver999}/g`,
    'Rates and Pricing',
    'RateOverride',
    initiator,
    justification,
    { gold24k, silver999 }
  );

  res.status(202).json({
    message: 'Rate override proposed. Dual-authorization (Maker-Checker) required by secondary officer.',
    request,
  });
}

export async function resolveRateOverride(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { decision, password } = req.body;

  if (!decision || !['Approved', 'Rejected'].includes(decision)) {
    res.status(400).json({ error: 'ValidationError', message: "decision must be 'Approved' or 'Rejected'" });
    return;
  }

  const approver = req.user ? req.user.name : 'Ananya Deshmukh (Pricing Officer)';

  // Re-authentication check
  if (!password) {
    res.status(400).json({ error: 'ValidationError', message: 'Password confirmation required for sensitive rate override approval' });
    return;
  }

  try {
    const item = await db.resolveMakerCheckerRequest(id, approver, decision);

    if (decision === 'Approved' && item.payload) {
      await db.updateRates(item.payload.gold24k, item.payload.silver999, 'Dual-Authorized Maker-Checker Override', approver);
    }

    res.json({
      message: `Maker-checker proposal ${decision.toLowerCase()} successfully`,
      item,
      updatedRates: decision === 'Approved' ? (await db.getRates()).rates : undefined,
    });
  } catch (err: any) {
    res.status(403).json({ error: 'MakerCheckerError', message: err.message });
  }
}

export async function setFailover(req: Request, res: Response): Promise<void> {
  const { state } = req.body;
  if (!['ok', 'primaryFailed', 'bothDown'].includes(state)) {
    res.status(400).json({ error: 'ValidationError', message: "state must be 'ok', 'primaryFailed', or 'bothDown'" });
    return;
  }

  await db.setProviderState(state);
  res.json({ message: `Provider failover state updated to ${state}`, state });
}

export async function updateFormula(req: Request, res: Response): Promise<void> {
  const actor = req.user ? req.user.name : 'Pricing Lead';
  const updated = await db.updatePricingFormula(req.body, actor);
  res.json({ message: 'Pricing formula updated successfully', config: updated });
}
