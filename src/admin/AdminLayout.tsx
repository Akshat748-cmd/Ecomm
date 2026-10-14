import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { BRAND_NAME } from '../lib/constants';
import type { AdminRole } from '../data/types';
import { ADMIN_MODULES, canAccessModule } from '../lib/adminPermissions';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  ShieldCheck,
  BarChart3,
  KeyRound,
  FileText,
  Cpu,
  Settings,
  LogOut,
  ExternalLink,
  Lock,
  Clock,
  AlertTriangle,
  Eye,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  '/admin': LayoutDashboard,
  '/admin/rates': TrendingUp,
  '/admin/catalogue': Layers,
  '/admin/inventory': Boxes,
  '/admin/orders': ShoppingBag,
  '/admin/customers': Users,
  '/admin/compliance': ShieldCheck,
  '/admin/reports': BarChart3,
  '/admin/roles': KeyRound,
  '/admin/audit': FileText,
  '/admin/platform': Cpu,
  '/admin/settings': Settings,
};

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    adminUser,
    activeRole,
    sessionTimedOut,
    demoMode,
    sessionTimeoutSeconds,
    setActiveRole,
    logoutAdmin,
    touchAdminActivity,
    triggerSessionTimeout,
    reauthenticateAdmin,
    setDemoMode,
  } = useAppStore();

  // Local seconds remaining before session idle timeout
  const timeoutLimit = demoMode ? 60 : sessionTimeoutSeconds;
  const [secondsRemaining, setSecondsRemaining] = useState(timeoutLimit);
  const [reauthModalOpen, setReauthModalOpen] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState<string | null>(null);

  // Sync timeout duration when demoMode changes
  useEffect(() => {
    setSecondsRemaining(demoMode ? 60 : sessionTimeoutSeconds);
  }, [demoMode, sessionTimeoutSeconds]);

  // Idle session countdown timer
  useEffect(() => {
    if (sessionTimedOut) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          triggerSessionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionTimedOut, triggerSessionTimeout]);

  // Reset idle timer on user click/interaction within layout
  const handleUserActivity = () => {
    if (!sessionTimedOut) {
      setSecondsRemaining(demoMode ? 60 : sessionTimeoutSeconds);
      touchAdminActivity();
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as AdminRole;
    setActiveRole(newRole);
  };

  const handleReauthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reauthPassword.trim()) {
      setReauthError('Please enter your passphrase.');
      return;
    }
    const success = reauthenticateAdmin(reauthPassword);
    if (success) {
      setReauthModalOpen(false);
      setReauthPassword('');
      setReauthError(null);
      setSecondsRemaining(demoMode ? 60 : sessionTimeoutSeconds);
    } else {
      setReauthError('Invalid credentials. Minimum 4 characters required.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  // Check if current route is allowed for active role
  const isCurrentModuleAllowed = canAccessModule(activeRole, location.pathname);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onClick={handleUserActivity}
      onKeyDown={handleUserActivity}
      className="min-h-screen md:h-screen bg-[#FFFBF3] text-[#7A6A55] flex flex-col font-sans md:overflow-hidden"
    >
      {/* 1. TOP HEADER */}
      <header className="bg-[#FFFFFF] border-b border-[#EADFC8] px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-xs">
        {/* Left: Brand & Admin Console Badge */}
        <div className="flex items-center gap-3">
          <Link to="/admin" className="font-serif text-xl font-bold text-[#5A4630] tracking-wider">
            {BRAND_NAME}
          </Link>
          <span className="text-[11px] font-sans font-semibold text-[#5A4630] px-2.5 py-0.5 bg-[#F1E3BD] border border-[#EADFC8] rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-pulse"></span>
            Admin Console
          </span>
        </div>

        {/* Right: Role Switcher, Session Countdown, Demo Toggle, User Menu */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-end">
          {/* Demo Mode Toggle (60s session timeout test) */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-xs">
            <Sliders className="w-3.5 h-3.5 text-[#C9A24B]" />
            <label className="flex items-center gap-1.5 text-[11px] text-[#5A4630] cursor-pointer font-medium select-none">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="rounded text-[#C9A24B] focus:ring-[#C9A24B] w-3 h-3"
              />
              <span>Demo Mode (60s Timeout)</span>
            </label>
          </div>

          {/* Session Countdown Indicator */}
          <div
            title={`Session auto-expires after ${demoMode ? '60s' : '15m'} idle`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium ${
              secondsRemaining <= 15
                ? 'bg-[#FDF0EE] border-[#F1B5AC] text-[#9E3624] animate-pulse'
                : 'bg-[#FFFBF3] border-[#EADFC8] text-[#5A4630]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#C9A24B]" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#7A6A55] font-medium hidden sm:inline">Role:</span>
            <select
              value={activeRole}
              onChange={handleRoleChange}
              aria-label="Switch administrative role"
              className="bg-[#FFFBF3] border border-[#EADFC8] text-[#5A4630] text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Pricing">Pricing Officer</option>
              <option value="Catalogue">Catalogue Manager</option>
              <option value="Warehouse">Warehouse Custodian</option>
              <option value="Support">Support Desk</option>
              <option value="Finance">Finance Officer</option>
              <option value="Auditor">Auditor (Read-Only)</option>
            </select>
          </div>

          {/* Staff Profile Capsule */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#EADFC8]">
            <div className="w-7 h-7 rounded-full bg-[#F8EFD9] border border-[#EADFC8] flex items-center justify-center font-bold text-xs text-[#5A4630]">
              VS
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-[#5A4630] leading-none line-clamp-1">
                {adminUser?.name || 'Vikram Sharma'}
              </div>
              <div className="text-[10px] text-[#7A6A55] leading-none mt-0.5">
                Principal Officer
              </div>
            </div>
          </div>

          {/* Storefront Link */}
          <Link
            to="/"
            target="_blank"
            className="hidden md:flex items-center gap-1 text-xs text-[#5A4630] hover:text-[#C9A24B] px-2.5 py-1.5 rounded-lg border border-[#EADFC8] bg-[#FFFBF3]"
            title="Open Consumer Storefront in new tab"
          >
            <span>Store</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C9A24B]" />
          </Link>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-[#7A6A55] hover:text-[#9E3624] p-1.5 rounded-lg hover:bg-[#F8EFD9] transition-colors"
            title="Sign out of Admin Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Auditor Read-Only Banner */}
      {activeRole === 'Auditor' && (
        <div className="bg-[#EAEFF5] border-b border-[#C1D2EC] px-4 sm:px-6 py-2 text-xs text-[#2A4B7C] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#2A4B7C]" />
            <span>
              <strong>Auditor Inspection Mode:</strong> You possess strictly read-only supervisory clearance across all institutional modules. Modifying records is disabled.
            </span>
          </div>
          <Badge variant="neutral" size="sm">Read-Only</Badge>
        </div>
      )}

      {/* 2. BODY CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 md:overflow-hidden">
        {/* Sidebar Navigation (surface-alt #F8EFD9) */}
        <aside className="w-full md:w-64 bg-[#F8EFD9] border-r border-[#EADFC8] flex flex-col shrink-0 md:h-full md:overflow-hidden">
          {/* Operations Header */}
          <div className="p-4 border-b border-[#EADFC8]/80 shrink-0">
            <div className="text-[10px] font-bold text-[#7A6A55] uppercase tracking-wider mb-1">
              Modules & Clearance
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-[#5A4630]">
                {activeRole}
              </span>
              <Badge variant={activeRole === 'Super Admin' ? 'gold' : 'neutral'} size="sm">
                {activeRole === 'Super Admin' ? 'All Modules' : 'RBAC Guarded'}
              </Badge>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1">
            {ADMIN_MODULES.map((item) => {
              const Icon = ICON_MAP[item.path] || LayoutDashboard;
              const hasAccess = item.permissions[activeRole]?.view ?? false;
              const isCurrent = location.pathname === item.path;

              if (!hasAccess) {
                return (
                  <div
                    key={item.path}
                    title={`Restricted: ${activeRole} does not possess viewing privileges for ${item.moduleName}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#7A6A55]/40 bg-transparent cursor-not-allowed select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#7A6A55]/30" />
                      <span>{item.moduleName}</span>
                    </div>
                    <Lock className="w-3 h-3 text-[#7A6A55]/40" />
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-[#FFFFFF] text-[#5A4630] font-bold shadow-xs border border-[#EADFC8]'
                      : 'text-[#7A6A55] hover:bg-[#FFFBF3] hover:text-[#5A4630]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#C9A24B]' : 'text-[#7A6A55]'}`} />
                    <span>{item.moduleName}</span>
                  </div>
                  {activeRole === 'Auditor' && (
                    <span className="text-[9px] uppercase px-1 py-0.2 bg-[#EAEFF5] text-[#2A4B7C] rounded font-bold">
                      Read
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Sensitive Action Re-auth Trigger */}
          <div className="p-3 border-t border-[#EADFC8] bg-[#FFFBF3]/50 shrink-0">
            <button
              type="button"
              onClick={() => setReauthModalOpen(true)}
              className="w-full text-left p-2.5 rounded-lg border border-[#EADFC8] bg-white text-xs hover:border-[#C9A24B] transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-[#C9A24B]" />
                <span className="font-semibold text-[#5A4630]">Re-Authenticate</span>
              </div>
              <Badge variant="neutral" size="sm">Maker-Checker</Badge>
            </button>
          </div>
        </aside>

        {/* 3. MAIN OUTLET */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 md:overflow-y-auto overflow-x-hidden min-h-0">
          {!isCurrentModuleAllowed ? (
            /* Least Privilege Restriction Notice */
            <div className="max-w-xl mx-auto py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#FDF0EE] border border-[#F1B5AC] text-[#9E3624] mx-auto flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#5A4630]">
                Access Restricted by Role Policy
              </h2>
              <p className="text-xs text-[#7A6A55] leading-relaxed">
                Your active role (<strong>{activeRole}</strong>) does not have authorization to view this operational module under institutional least-privilege policies.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link to="/admin">
                  <Button variant="primary" size="md">
                    Return to Dashboard
                  </Button>
                </Link>
                <Link to="/admin/roles">
                  <Button variant="secondary" size="md">
                    Review Permissions Matrix
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* 4. SESSION TIMEOUT OVERLAY MODAL */}
      {sessionTimedOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#5A4630]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-[#EADFC8] shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FDF0EE] border border-[#F1B5AC] text-[#9E3624] mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A24B]">
                Session Security Enforced
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#5A4630]">
                Session Expired, Sign In Again
              </h2>
              <p className="text-xs text-[#7A6A55] leading-relaxed">
                Your console session timed out after {demoMode ? '60 seconds (Demo Mode)' : '15 minutes'} of inactivity to protect high-value pricing and bullion dispatch vaults.
              </p>
            </div>

            <form onSubmit={handleReauthSubmit} className="space-y-3 text-left text-xs">
              <div>
                <label className="block text-[#5A4630] font-semibold mb-1">
                  Re-enter Security Passphrase
                </label>
                <input
                  type="password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  placeholder="Enter security passphrase"
                  autoFocus
                  required
                  className="w-full px-3 py-2.5 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                />
              </div>

              {reauthError && (
                <div className="p-2 bg-[#FDF0EE] text-[#9E3624] text-[11px] rounded border border-[#F1B5AC]">
                  {reauthError}
                </div>
              )}

              <div className="pt-2 space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Resume Session
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Sign Out & Relogin with MFA
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. RE-AUTHENTICATION MODAL FOR SENSITIVE ACTIONS */}
      <Modal
        isOpen={reauthModalOpen}
        onClose={() => setReauthModalOpen(false)}
        title="Administrative Re-Authentication"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#F8EFD9] border border-[#EADFC8] rounded-xl flex items-start gap-2.5 text-[#5A4630]">
            <ShieldAlert className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
            <div>
              <strong>Dual Authorization & Re-Auth:</strong> Sensitive bullion pricing overrides, role elevations, and high-value refund decisions require explicit password re-verification.
            </div>
          </div>

          <form onSubmit={handleReauthSubmit} className="space-y-3">
            <div>
              <label className="block text-[#5A4630] font-semibold mb-1">
                Authorized Officer Passphrase
              </label>
              <input
                type="password"
                value={reauthPassword}
                onChange={(e) => setReauthPassword(e.target.value)}
                placeholder="Confirm password"
                autoFocus
                required
                className="w-full px-3 py-2.5 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              />
            </div>

            {reauthError && (
              <div className="p-2 bg-[#FDF0EE] text-[#9E3624] text-[11px] rounded border border-[#F1B5AC]">
                {reauthError}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReauthModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Confirm Passphrase
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
