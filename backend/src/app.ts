import express from 'express';
import cors from 'cors';
import { authenticateJwt } from './middleware/auth';
import { requireRole } from './middleware/rbac';
import { errorHandler } from './middleware/errorHandler';

import * as authController from './controllers/authController';
import * as ratesController from './controllers/ratesController';
import * as productsController from './controllers/productsController';
import * as quotesController from './controllers/quotesController';
import * as ordersController from './controllers/ordersController';
import * as paymentsController from './controllers/paymentsController';
import * as inventoryController from './controllers/inventoryController';
import * as giftingController from './controllers/giftingController';
import * as logisticsController from './controllers/logisticsController';
import * as complianceController from './controllers/complianceController';

export function createApp(): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health Check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Precious Commerce API', timestamp: new Date().toISOString() });
  });

  const api = express.Router();

  // --- PUBLIC COMMERCE ROUTES ---
  api.get('/rates', ratesController.getRates);
  api.get('/products', productsController.listProducts);
  api.get('/products/slug/:slug', productsController.getProductBySlug);
  api.get('/products/id/:id', productsController.getProductById);
  api.get('/certificates/:certNo', productsController.verifyCertificate);

  api.post('/quotes/lock', quotesController.lockQuote);
  api.get('/quotes/:id', quotesController.getQuote);
  api.post('/quotes/:id/requote', quotesController.requote);

  api.post('/orders', ordersController.createOrder);
  api.get('/orders/:id', ordersController.getOrder);

  api.post('/logistics/pincode-check', logisticsController.checkPincodeServiceability);

  api.post('/corporate/enquiries', giftingController.submitEnquiry);

  api.post('/payments/session', paymentsController.createPaymentSession);
  api.post('/payments/webhook', paymentsController.handlePaymentWebhook);

  // --- ADMIN AUTH ROUTES ---
  api.post('/admin/auth/login', authController.login);
  api.post('/admin/auth/mfa', authController.verifyMfa);
  api.get('/admin/auth/profile', authenticateJwt, authController.getProfile);

  // --- ADMIN PROTECTED ROUTES ---
  // Orders
  api.get('/admin/orders', authenticateJwt, ordersController.listOrders);
  api.patch('/admin/orders/:id/status', authenticateJwt, ordersController.updateOrderStatus);
  api.post('/admin/orders/:id/invoice', authenticateJwt, ordersController.attachInvoice);

  // Rates & Pricing (Super Admin, Pricing)
  api.post('/admin/rates/propose', authenticateJwt, requireRole('Super Admin', 'Pricing'), ratesController.proposeRateOverride);
  api.post('/admin/rates/resolve/:id', authenticateJwt, requireRole('Super Admin', 'Pricing'), ratesController.resolveRateOverride);
  api.post('/admin/rates/failover', authenticateJwt, requireRole('Super Admin', 'Pricing'), ratesController.setFailover);
  api.post('/admin/rates/formula', authenticateJwt, requireRole('Super Admin', 'Pricing'), ratesController.updateFormula);

  // Products (Super Admin, Catalogue)
  api.post('/admin/products', authenticateJwt, requireRole('Super Admin', 'Catalogue'), productsController.createProduct);
  api.put('/admin/products/:id', authenticateJwt, requireRole('Super Admin', 'Catalogue'), productsController.updateProduct);

  // Inventory (Super Admin, Warehouse)
  api.get('/admin/inventory', authenticateJwt, inventoryController.listInventory);
  api.post('/admin/inventory/action', authenticateJwt, requireRole('Super Admin', 'Warehouse'), inventoryController.stockAction);

  // Corporate Gifting
  api.get('/admin/corporate/enquiries', authenticateJwt, giftingController.listEnquiries);
  api.post('/admin/corporate/enquiries/:id/quote', authenticateJwt, giftingController.generateQuote);
  api.post('/admin/corporate/enquiries/:id/approve', authenticateJwt, giftingController.approveQuote);
  api.post('/admin/corporate/enquiries/:id/recipients', authenticateJwt, giftingController.importRecipients);

  // Compliance & Governance (Super Admin, Auditor)
  api.get('/admin/compliance', authenticateJwt, complianceController.getComplianceChecklist);
  api.patch('/admin/compliance/:id', authenticateJwt, requireRole('Super Admin', 'Auditor'), complianceController.toggleComplianceItem);

  // Audit Trail & Maker-Checker
  api.get('/admin/audit', authenticateJwt, complianceController.listAuditLogs);
  api.get('/admin/maker-checker', authenticateJwt, complianceController.listMakerChecker);

  app.use('/api', api);
  app.use(errorHandler);

  return app;
}
