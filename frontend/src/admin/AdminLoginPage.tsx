import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { BRAND_NAME } from '../lib/constants';
import type { AdminRole } from '../data/types';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Smartphone,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  useSEO({
    title: 'Admin Authentication & MFA',
    description: 'Secure staff login and multi-factor authentication for the Precious Commerce Platform administrative console.',
    canonicalPath: '/admin/login',
  });

  const navigate = useNavigate();
  const { loginAdmin, verifyMfa } = useAppStore();

  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [email, setEmail] = useState('v.sharma@precious.internal');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState<AdminRole>('Super Admin');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide valid staff credentials.');
      return;
    }
    setError(null);
    loginAdmin(email.trim(), role);
    setStep('mfa');
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.trim().length !== 6) {
      setError('MFA security passcode must be exactly 6 digits.');
      return;
    }

    const verified = verifyMfa(mfaCode.trim());
    if (verified) {
      navigate('/admin');
    } else {
      setError('Invalid authenticator code. Please enter 6 digits.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF3] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-block">
            <h1 className="font-serif text-3xl font-bold text-[#5A4630] tracking-wider">
              {BRAND_NAME}
            </h1>
          </Link>
          <p className="text-xs text-[#C9A24B] tracking-widest uppercase font-semibold">
            Institutional Operations & Admin Console
          </p>
        </div>

        {/* Auth Card */}
        <Card variant="surface" className="p-6 sm:p-8 space-y-6 border-[#EADFC8] shadow-md">
          {step === 'credentials' ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
                <h2 className="text-base font-serif font-bold text-[#5A4630] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C9A24B]" />
                  Step 1: Staff Credentials
                </h2>
                <Badge variant="gold" size="sm">Phase 6 Verified</Badge>
              </div>

              {/* Statutory Notice */}
              <div className="p-3.5 bg-[#F8EFD9] rounded-xl text-xs text-[#5A4630] flex items-start gap-2.5 border border-[#EADFC8]">
                <ShieldAlert className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold">Security Notice</div>
                  <div className="text-[#7A6A55] leading-relaxed">
                    <strong>Admin identity is separate from customer accounts.</strong> High-privilege bullion pricing and dispatch actions require multi-factor verification.
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#FDF0EE] border border-[#F1B5AC] rounded-lg text-xs text-[#9E3624]">
                  {error}
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#5A4630] font-semibold mb-1">
                    Staff Identity (Internal Email)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. officer@precious.internal"
                    className="w-full px-3 py-2.5 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A4630] font-semibold mb-1">
                    Operational Role (Least Privilege)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AdminRole)}
                    className="w-full px-3 py-2.5 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                  >
                    <option value="Super Admin">Super Admin (Full Access)</option>
                    <option value="Pricing">Pricing Officer (Rate Engine & Spreads)</option>
                    <option value="Catalogue">Catalogue Manager (Assay Attributes)</option>
                    <option value="Warehouse">Warehouse Custodian (Vault Reserves)</option>
                    <option value="Support">Support Desk (Customer KYC & Concierge)</option>
                    <option value="Finance">Finance Officer (Settlements & ERP)</option>
                    <option value="Auditor">Auditor (Strictly Read-Only Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#5A4630] font-semibold mb-1">
                    Security Passphrase
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter security passphrase"
                    className="w-full px-3 py-2.5 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full mt-2"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to MFA Verification
                </Button>
              </form>
            </>
          ) : (
            /* Step 2: MFA Verification */
            <>
              <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
                <h2 className="text-base font-serif font-bold text-[#5A4630] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#C9A24B]" />
                  Step 2: Dual-Factor Verification (MFA)
                </h2>
                <Badge variant="sage" size="sm">Identity Confirmed</Badge>
              </div>

              <div className="p-3 bg-[#FFFBF3] rounded-xl border border-[#EADFC8] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#7A6A55]">Staff Identity:</span>
                  <span className="font-semibold text-[#5A4630]">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A6A55]">Assigned Role:</span>
                  <Badge variant="gold" size="sm">{role}</Badge>
                </div>
              </div>

              <div className="p-3 bg-[#DCE8D5] border border-[#A4C997] rounded-xl text-xs text-[#2D5A27] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Dual-Factor Auth TOTP generated. Enter any 6-digit code.</span>
              </div>

              {error && (
                <div className="p-3 bg-[#FDF0EE] border border-[#F1B5AC] rounded-lg text-xs text-[#9E3624]">
                  {error}
                </div>
              )}

              <form onSubmit={handleMfaSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#5A4630] font-semibold">
                      6-Digit Security Token
                    </label>
                    <button
                      type="button"
                      onClick={() => setMfaCode('123456')}
                      className="text-[11px] text-[#C9A24B] hover:underline font-semibold"
                    >
                      Fill Demo Code (123456)
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    required
                    className="w-full px-3 py-3 bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] font-mono text-center text-lg tracking-[0.35em] font-bold focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                  />
                  <p className="text-[11px] text-[#7A6A55] mt-1 text-center">
                    Accepts any 6 digits for prototype evaluation (e.g. 123456).
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    leftIcon={<KeyRound className="w-4 h-4" />}
                  >
                    Authenticate & Launch Console
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setStep('credentials');
                      setError(null);
                    }}
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    Change Credentials
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>

        {/* Footer links */}
        <div className="text-center text-xs text-[#7A6A55] space-y-2">
          <Link to="/" className="text-[#C9A24B] hover:underline font-medium">
            ← Return to Consumer Storefront
          </Link>
          <div className="text-[11px] text-[#7A6A55]/70">
            Precious Bullion & Artefacts Management Infrastructure • v2.6.4
          </div>
        </div>
      </div>
    </div>
  );
};
