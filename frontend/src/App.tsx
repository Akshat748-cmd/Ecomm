import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useRateHeartbeat } from './lib/useRateHeartbeat';

// Layouts
import { StoreLayout } from './store-site/StoreLayout';
import { AdminLayout } from './admin/AdminLayout';

// Store Site Pages
import { HomePage } from './store-site/HomePage';
import { CategoryPage } from './store-site/CategoryPage';
import { SearchPage } from './store-site/SearchPage';
import { ProductPage } from './store-site/ProductPage';
import { VerifyCertPage } from './store-site/VerifyCertPage';
import { WishlistPage } from './store-site/WishlistPage';
import { CartPage } from './store-site/CartPage';
import { CheckoutPage } from './store-site/CheckoutPage';
import { OrderPage } from './store-site/OrderPage';
import { AccountPage } from './store-site/AccountPage';
import { VaultPage } from './store-site/VaultPage';
import { KnowledgePage } from './store-site/KnowledgePage';
import { BlogPage } from './store-site/BlogPage';
import { GiftingEnquiryPage } from './store-site/GiftingEnquiryPage';
import { PolicyPage } from './store-site/PolicyPage';
import { OccasionsPage } from './store-site/OccasionsPage';
import { NotFoundPage } from './store-site/NotFoundPage';
import { DebugPage } from './store-site/DebugPage';

// Admin Pages
import { AdminLoginPage } from './admin/AdminLoginPage';
import { AdminDashboardPage } from './admin/AdminDashboardPage';
import { AdminRatesPage } from './admin/AdminRatesPage';
import { AdminCataloguePage } from './admin/AdminCataloguePage';
import { AdminInventoryPage } from './admin/AdminInventoryPage';
import { AdminOrdersPage } from './admin/AdminOrdersPage';
import { AdminOrderDetailPage } from './admin/AdminOrderDetailPage';
import { AdminCustomersPage } from './admin/AdminCustomersPage';
import { AdminCompliancePage } from './admin/AdminCompliancePage';
import { AdminReportsPage } from './admin/AdminReportsPage';
import { AdminRolesPage } from './admin/AdminRolesPage';
import { AdminAuditPage } from './admin/AdminAuditPage';
import { AdminPlatformPage } from './admin/AdminPlatformPage';
import { AdminSettingsPage } from './admin/AdminSettingsPage';

const AppContent: React.FC = () => {
  // Start rate ticker & quote expiry engine
  useRateHeartbeat();

  return (
    <Routes>
      {/* Admin Login (Standalone) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Console Nested Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="rates" element={<AdminRatesPage />} />
        <Route path="catalogue" element={<AdminCataloguePage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="compliance" element={<AdminCompliancePage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="roles" element={<AdminRolesPage />} />
        <Route path="audit" element={<AdminAuditPage />} />
        <Route path="platform" element={<AdminPlatformPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Storefront Nested Routes */}
      <Route path="/" element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        <Route path="c/:category" element={<CategoryPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="p/:slug" element={<ProductPage />} />
        <Route path="verify/:certNo" element={<VerifyCertPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order/:id" element={<OrderPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="vault" element={<VaultPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="gifting-enquiry" element={<GiftingEnquiryPage />} />
        <Route path="corporate-gifting" element={<GiftingEnquiryPage />} />
        <Route path="occasions" element={<OccasionsPage />} />
        <Route path="festivals" element={<OccasionsPage />} />

        {/* Hidden Diagnostic Route */}
        <Route path="debug" element={<DebugPage />} />

        {/* Policy Pages */}
        <Route path="terms" element={<PolicyPage />} />
        <Route path="privacy" element={<PolicyPage />} />
        <Route path="shipping" element={<PolicyPage />} />
        <Route path="returns" element={<PolicyPage />} />
        <Route path="authenticity" element={<PolicyPage />} />
        <Route path="consumer-disclosures" element={<PolicyPage />} />
        <Route path="grievance" element={<PolicyPage />} />
        <Route path="faq" element={<PolicyPage />} />
        <Route path="contact" element={<PolicyPage />} />
        <Route path="support" element={<PolicyPage />} />

        {/* Friendly 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
