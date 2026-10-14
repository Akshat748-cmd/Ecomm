import type { AdminRole } from '../data/types';

export interface ModulePermission {
  moduleName: string;
  path: string;
  description: string;
  permissions: Record<AdminRole, { view: boolean; create: boolean; edit: boolean; approve: boolean }>;
}

export const ADMIN_MODULES: ModulePermission[] = [
  {
    moduleName: 'Dashboard',
    path: '/admin',
    description: 'Executive KPI telemetry, spot tickers, pending approvals, and operational health.',
    permissions: {
      'Super Admin': { view: true, create: true, edit: true, approve: true },
      Pricing: { view: true, create: false, edit: false, approve: false },
      Catalogue: { view: true, create: false, edit: false, approve: false },
      Warehouse: { view: true, create: false, edit: false, approve: false },
      Support: { view: true, create: false, edit: false, approve: false },
      Finance: { view: true, create: false, edit: false, approve: false },
      Auditor: { view: true, create: false, edit: false, approve: false },
    },
  },
  {
    moduleName: 'Rates and Pricing',
    path: '/admin/rates',
    description: 'Live rate feeds, manual overrides, making charge formulas, and margins.',
    permissions: {
      'Super Admin': { view: true, create: true, edit: true, approve: true },
      Pricing: { view: true, create: true, edit: true, approve: true },
      Catalogue: { view: false, create: false, edit: false, approve: false },
      Warehouse: { view: false, create: false, edit: false, approve: false },
      Support: { view: false, create: false, edit: false, approve: false },
      Finance: { view: true, create: false, edit: true, approve: false },
      Auditor: { view: true, create: false, edit: false, approve: false },
    },
  },
  {
    moduleName: 'Catalogue',
    path: '/admin/catalogue',
    description: 'Product definitions, hallmarking assay attributes, and pricing model bindings.',
    permissions: {
      'Super Admin': { view: true, create: true, edit: true, approve: true },
      Pricing: { view: false, create: false, edit: false, approve: false },
      Catalogue: { view: true, create: true, edit: true, approve: true },
      Warehouse: { view: true, create: false, edit: false, approve: false },
      Support: { view: true, create: false, edit: false, approve: false },
      Finance: { view: false, create: false, edit: false, approve: false },
      Auditor: { view: true, create: false, edit: false, approve: false },
    },
  },
  {
    moduleName: 'Inventory & Quotes',
    path: '/admin/inventory',
    description: 'Physical vault reserves, lot batch serials, reservations, and 10-minute quotes.',
    permissions: {
      'Super Admin': { view: true, create: true, edit: true, approve: true },
      Pricing: { view: true, create: false, edit: false, approve: false },
      Catalogue: { view: true, create: false, edit: true, approve: false },
      Warehouse: { view: true, create: true, edit: true, approve: true },
      Support: { view: true, create: false, edit: false, approve: false },
      Finance: { view: true, create: false, edit: false, approve: false },
      Auditor: { view: true, create: false, edit: false, approve: false },
    },
  },
  {
    moduleName: 'Orders & Payments',
    path: '/admin/orders',
    description: 'Order lifecycle custody, payment outcomes, ERP invoice attachment, and returns.',
    permissions: {
      'Super Admin': { view: true, create: true, edit: true, approve: true },
      Pricing: { view: false, create: false, edit: false, approve: false },
      Catalogue: { view: false, create: false, edit: false, approve: false },
      Warehouse: { view: true, create: false, edit: true, approve: false },
      Support: { view: true, create: false, edit: true, approve: false },
      Finance: { view: true, create: false, edit: true, approve: true },
      Auditor: { view: true, create: false, edit: false, approve: false },
    },
  },
  {
    moduleName: 'Customers & Support',
    path: '/admin/customers',
    description: 'Investor verification, address book ledger, consent logs, and concierge tickets.',
    permissions: {
      'Super Admin': { view: true, create: true, edit: true, approve: true },
      Pricing: { view: false, create: false, edit: false, approve: false },
      Catalogue: { view: false, create: false, edit: false, approve: false },
      Warehouse: { view: false, create: false, edit: false, approve: false },
      Support: { view: true, create: true, edit: true, approve: true },
      Finance: { view: false, create: false, edit: false, approve: false },
      Auditor: { view: true, create: false, edit: false, approve: false },
    },
  },
  {
    moduleName: 'Compliance & Legal',
    path: '/admin/compliance',
    description: 'BIS Hallmark audit registries, Legal Metrology, and Grievance nodal escalation.',
    permissions: {
      'Super Admin': { view: true, create: true, edit: true, approve: true },
      Pricing: { view: false, create: false, edit: false, approve: false },
      Catalogue: { view: false, create: false, edit: false, approve: false },
      Warehouse: { view: false, create: false, edit: false, approve: false },
      Support: { view: false, create: false, edit: false, approve: false },
      Finance: { view: true, create: false, edit: false, approve: false },
      Auditor: { view: true, create: false, edit: false, approve: true },
    },
  },
  {
    moduleName: 'Reports & Analytics',
    path: '/admin/reports',
    description: 'Daily bullion reconciliation, tax liability, margin realization, and courier SLA.',
    permissions: {
      'Super Admin': { view: true, create: true, edit: true, approve: true },
      Pricing: { view: true, create: false, edit: false, approve: false },
      Catalogue: { view: false, create: false, edit: false, approve: false },
      Warehouse: { view: false, create: false, edit: false, approve: false },
      Support: { view: false, create: false, edit: false, approve: false },
      Finance: { view: true, create: true, edit: true, approve: true },
      Auditor: { view: true, create: false, edit: false, approve: false },
    },
  },
  {
    moduleName: 'Roles & Permissions',
    path: '/admin/roles',
    description: 'Least privilege RBAC matrix, maker-checker dual authorization, and access rules.',
    permissions: {
      'Super Admin': { view: true, create: true, edit: true, approve: true },
      Pricing: { view: false, create: false, edit: false, approve: false },
      Catalogue: { view: false, create: false, edit: false, approve: false },
      Warehouse: { view: false, create: false, edit: false, approve: false },
      Support: { view: false, create: false, edit: false, approve: false },
      Finance: { view: false, create: false, edit: false, approve: false },
      Auditor: { view: true, create: false, edit: false, approve: false },
    },
  },
  {
    moduleName: 'Audit Log',
    path: '/admin/audit',
    description: 'Cryptographic immutable activity log with actor, action, timestamp, and diff.',
    permissions: {
      'Super Admin': { view: true, create: false, edit: false, approve: true },
      Pricing: { view: true, create: false, edit: false, approve: false },
      Catalogue: { view: true, create: false, edit: false, approve: false },
      Warehouse: { view: true, create: false, edit: false, approve: false },
      Support: { view: true, create: false, edit: false, approve: false },
      Finance: { view: true, create: false, edit: false, approve: false },
      Auditor: { view: true, create: false, edit: false, approve: false },
    },
  },
  {
    moduleName: 'Platform & Integrations',
    path: '/admin/platform',
    description: 'Payment gateways, SMS/WhatsApp webhooks, ERP synchronizer, and carrier APIs.',
    permissions: {
      'Super Admin': { view: true, create: true, edit: true, approve: true },
      Pricing: { view: false, create: false, edit: false, approve: false },
      Catalogue: { view: false, create: false, edit: false, approve: false },
      Warehouse: { view: false, create: false, edit: false, approve: false },
      Support: { view: false, create: false, edit: false, approve: false },
      Finance: { view: false, create: false, edit: false, approve: false },
      Auditor: { view: true, create: false, edit: false, approve: false },
    },
  },
  {
    moduleName: 'Settings',
    path: '/admin/settings',
    description: 'Store parameters, demo mode toggle, quote expiration duration, and idle timeouts.',
    permissions: {
      'Super Admin': { view: true, create: true, edit: true, approve: true },
      Pricing: { view: false, create: false, edit: false, approve: false },
      Catalogue: { view: false, create: false, edit: false, approve: false },
      Warehouse: { view: false, create: false, edit: false, approve: false },
      Support: { view: false, create: false, edit: false, approve: false },
      Finance: { view: false, create: false, edit: false, approve: false },
      Auditor: { view: true, create: false, edit: false, approve: false },
    },
  },
];

export const canAccessModule = (role: AdminRole, path: string): boolean => {
  const mod = ADMIN_MODULES.find((m) => m.path === path);
  if (!mod) return true;
  return mod.permissions[role]?.view ?? false;
};

export const canPerformAction = (
  role: AdminRole,
  moduleName: string,
  action: 'view' | 'create' | 'edit' | 'approve'
): boolean => {
  const mod = ADMIN_MODULES.find((m) => m.moduleName.toLowerCase() === moduleName.toLowerCase());
  if (!mod) return false;
  return mod.permissions[role]?.[action] ?? false;
};
