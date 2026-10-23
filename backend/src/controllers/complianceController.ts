import type { Request, Response } from 'express';
import { db } from '../database/database';

export async function getComplianceChecklist(_req: Request, res: Response): Promise<void> {
  const checklist = await db.getComplianceChecklist();
  res.json({ checklist, total: checklist.length });
}

export async function toggleComplianceItem(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { isCompliant } = req.body;

  if (isCompliant === undefined) {
    res.status(400).json({ error: 'ValidationError', message: 'isCompliant boolean required' });
    return;
  }

  const auditor = req.user ? req.user.name : 'Sunita Rao (Lead Auditor)';
  const updated = await db.updateComplianceItem(id, Boolean(isCompliant), auditor);

  if (!updated) {
    res.status(404).json({ error: 'NotFound', message: `Compliance item ${id} not found` });
    return;
  }

  res.json({ message: 'Compliance record audited and updated.', item: updated });
}

export async function listAuditLogs(_req: Request, res: Response): Promise<void> {
  const logs = await db.getAuditLogs();
  res.json({ logs, total: logs.length });
}

export async function listMakerChecker(_req: Request, res: Response): Promise<void> {
  const queue = await db.getMakerCheckerQueue();
  res.json({ queue, total: queue.length });
}
