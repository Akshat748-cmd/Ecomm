import type { Request, Response } from 'express';
import { db } from '../database/database';

export async function submitEnquiry(req: Request, res: Response): Promise<void> {
  const {
    companyName,
    contactName,
    email,
    phone,
    gstin,
    occasion,
    budgetPerRecipient,
    recipientCount,
    productPreferences,
    deliverySchedule,
    customizationNotes,
  } = req.body;

  if (!companyName || !contactName || !email || !phone || !occasion || !budgetPerRecipient || !recipientCount) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Company, contact person, email, phone, occasion, budget, and recipient count are mandatory',
    });
    return;
  }

  const record = await db.createCorporateEnquiry({
    companyName,
    contactName,
    email,
    phone,
    gstin,
    occasion,
    budgetPerRecipient: Number(budgetPerRecipient),
    recipientCount: Number(recipientCount),
    productPreferences,
    deliverySchedule,
    customizationNotes,
  });

  res.status(201).json({
    message: 'Corporate enquiry submitted successfully. Institutional gifting concierge assigned.',
    enquiry: record,
  });
}

export async function listEnquiries(_req: Request, res: Response): Promise<void> {
  const enquiries = await db.getCorporateEnquiries();
  res.json({ enquiries, total: enquiries.length });
}

export async function generateQuote(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { unitPrice, customizationFee, packagingFee, paymentTerms, validDays } = req.body;

  const enquiry = (await db.getCorporateEnquiries()).find((e) => e.id === id);
  if (!enquiry) {
    res.status(404).json({ error: 'NotFound', message: `Enquiry ${id} not found` });
    return;
  }

  const actor = req.user ? req.user.name : 'Corporate Concierge Lead';
  const qty = enquiry.recipientCount;
  const baseTotal = (Number(unitPrice) + Number(customizationFee || 0) + Number(packagingFee || 0)) * qty;
  const gst = Math.round(baseTotal * 0.03);
  const grandTotal = baseTotal + gst;

  const quoteData = {
    quoteId: `CORP-QT-${Date.now()}`,
    unitPrice: Number(unitPrice),
    customizationFee: Number(customizationFee || 0),
    packagingFee: Number(packagingFee || 0),
    subtotal: baseTotal,
    taxAmount: gst,
    grandTotal,
    paymentTerms: paymentTerms || '50% advance upon proof approval, balance on dispatch',
    validUntil: new Date(Date.now() + (validDays || 14) * 86400000).toISOString(),
    issuedBy: actor,
  };

  const updated = await db.updateCorporateEnquiry(id, {
    status: 'Quote Issued',
    quoteData,
  }, actor);

  res.json({ message: 'Institutional quotation generated and issued to client.', enquiry: updated });
}

export async function approveQuote(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { approvedByClient, remarks } = req.body;

  const actor = req.user ? req.user.name : (approvedByClient || 'Client Executive');
  const updated = await db.updateCorporateEnquiry(id, {
    status: 'Approved',
    customizationNotes: remarks ? `${remarks} (Approved)` : undefined,
  }, actor);

  res.json({ message: 'Corporate quotation approved. Production and branding proof unblocked.', enquiry: updated });
}

export async function importRecipients(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const { recipients } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    res.status(400).json({ error: 'ValidationError', message: 'recipients array is required' });
    return;
  }

  // Validate recipients structure
  const invalid = recipients.filter((r) => !r.name || !r.pincode || !r.street || !r.city);
  if (invalid.length > 0) {
    res.status(400).json({
      error: 'ValidationError',
      message: `${invalid.length} recipient addresses have missing fields (name, street, city, or pincode required)`,
    });
    return;
  }

  const actor = req.user ? req.user.name : 'Logistics Officer';
  const updated = await db.updateCorporateEnquiry(id, {
    status: 'Fulfillment',
  }, actor);

  res.json({
    message: `Batch imported ${recipients.length} corporate recipient addresses. Split dispatch initialized.`,
    count: recipients.length,
    enquiry: updated,
  });
}
