import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR, formatFullDateTime } from '../lib/pricing';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  MapPin,
  Bell,
  Package,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Award,
  Bookmark,
  LogOut,
  LogIn,
  Eye,
  EyeOff,
  Download,
  Mail,
  QrCode,
  Lock,
} from 'lucide-react';
import type { Customer } from '../data/types';

// Masking helpers for statutory privacy
const maskPan = (pan?: string) => {
  if (!pan || pan.length < 10) return pan || 'Not Registered';
  return `${pan.slice(0, 5)}****${pan.slice(-1)}`;
};

const maskPhone = (phone?: string) => {
  if (!phone) return 'Not Provided';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length >= 10) {
    const last3 = clean.slice(-3);
    const prefix = clean.startsWith('+91') ? '+91 ' : '';
    const digits = clean.replace('+91', '');
    const first2 = digits.slice(0, 2);
    return `${prefix}${first2}*** **${last3}`;
  }
  return phone;
};

const maskGstin = (gstin?: string) => {
  if (!gstin || gstin.length < 15) return gstin || 'Not Registered';
  return `${gstin.slice(0, 6)}****${gstin.slice(-3)}`;
};

export const AccountPage: React.FC = () => {
  useSEO({
    title: 'Customer Account & Investor Dossier',
    description: 'Manage verified addresses, DPDP Act consent settings, order histories, tax invoices, and purity certificates.',
    canonicalPath: '/account',
  });

  const {
    authenticatedCustomer,
    customers,
    orders,
    products,
    savedForLater,
    wishlist,
    moveSavedToCart,
    removeSavedForLater,
    toggleWishlist,
    submitReturnRequest,
    requestOtp,
    verifyOtp,
    customerLogout,
    updateCustomerProfile,
    updateCustomerAddress,
    deleteCustomerAddress,
  } = useAppStore();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'invoices' | 'certificates' | 'saved' | 'addresses' | 'preferences' | 'returns'>('orders');

  // Login / Registration Form State
  const [loginContact, setLoginContact] = useState('+91 98200 11223');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginName, setLoginName] = useState('Vikramaditya Singhania');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [dpdpConsent, setDpdpConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(true);

  // Profile Privacy Mask Toggles
  const [showMaskedPan, setShowMaskedPan] = useState(true);
  const [showMaskedPhone, setShowMaskedPhone] = useState(true);

  // Profile Edit Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editAnniversary, setEditAnniversary] = useState('');
  const [editPan, setEditPan] = useState('');
  const [editGstin, setEditGstin] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Sensitive Verification Step Modal
  const [sensitiveOtpModalOpen, setSensitiveOtpModalOpen] = useState(false);
  const [sensitiveOtpInput, setSensitiveOtpInput] = useState('');

  // Address Book Modal State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrType, setAddrType] = useState<'Home' | 'Office'>('Home');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');

  // Tax Invoice Modal State
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<any | null>(null);
  const [invoiceEmailToast, setInvoiceEmailToast] = useState<string | null>(null);

  // Certificate Modal State
  const [certModalItem, setCertModalItem] = useState<any | null>(null);

  // Return Request Form State
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [returnReason, setReturnReason] = useState('');
  const [returnSuccessMessage, setReturnSuccessMessage] = useState<string | null>(null);

  // Current logged in customer fallback (for resilient display)
  const currentCustomer: Customer | null = authenticatedCustomer;

  // Filter orders for the current user
  const customerOrders = currentCustomer
    ? orders.filter((o) => o.customerId === currentCustomer.id || !o.customerId || o.customerEmail === currentCustomer.email)
    : [];

  // Handle OTP Request
  const handleRequestOtp = () => {
    setOtpError(null);
    setOtpSuccessMsg(null);
    if (!loginContact.trim()) {
      setOtpError('Please enter a valid mobile number or email address.');
      return;
    }
    const res = requestOtp(loginContact.trim());
    if (!res.success) {
      setOtpError(res.message);
    } else {
      setOtpRequested(true);
      setOtpSuccessMsg(res.message);
      setLoginOtp('789012'); // Auto-fill demo OTP for convenience
    }
  };

  // Handle Login / Registration Submit
  const handleVerifyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!loginOtp.trim()) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }
    if (!dpdpConsent) {
      setOtpError('DPDP Act consent is mandatory to process order identity.');
      return;
    }

    const res = verifyOtp(loginContact.trim(), loginOtp.trim(), {
      name: loginName.trim() || undefined,
      marketingConsent,
    });

    if (!res.success) {
      setOtpError(res.message);
    } else {
      setOtpRequested(false);
      setLoginOtp('');
      setOtpSuccessMsg(null);
    }
  };

  // One-click demo sign-in
  const handleQuickDemoLogin = () => {
    const demoCust = customers[0];
    if (demoCust) {
      verifyOtp(demoCust.phone, '123456', { name: demoCust.name });
    }
  };

  // Profile Edit Handlers
  const handleOpenEditProfile = () => {
    if (!currentCustomer) return;
    setEditName(currentCustomer.name);
    setEditDob(currentCustomer.dateOfBirth || '1985-06-15');
    setEditAnniversary(currentCustomer.anniversary || '2012-11-28');
    setEditPan(currentCustomer.panNumber || currentCustomer.pan || 'ABCDE1234F');
    setEditGstin(currentCustomer.gstin || '27AAACA1234F1Z8');
    setProfileError(null);
    setProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    // Validate PAN Format
    if (editPan.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(editPan.trim().toUpperCase())) {
        setProfileError('Invalid PAN format. Must match standard statutory format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F).');
        return;
      }
    }

    // Validate GSTIN Format
    if (editGstin.trim()) {
      const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
      if (!gstinRegex.test(editGstin.trim().toUpperCase())) {
        setProfileError('Invalid GSTIN format. Must match standard 15-character GST identification format.');
        return;
      }
    }

    // If PAN changed, trigger sensitive OTP verification modal
    const panChanged = (currentCustomer?.panNumber || currentCustomer?.pan) !== editPan.trim().toUpperCase();
    if (panChanged) {
      setSensitiveOtpModalOpen(true);
      return;
    }

    applyProfileUpdate();
  };

  const applyProfileUpdate = () => {
    const res = updateCustomerProfile({
      name: editName.trim(),
      dateOfBirth: editDob || undefined,
      anniversary: editAnniversary || undefined,
      panNumber: editPan.trim().toUpperCase() || undefined,
      panVerified: editPan.trim().length === 10,
      gstin: editGstin.trim().toUpperCase() || undefined,
      kycStatus: editPan.trim().length === 10 ? 'Verified' : currentCustomer?.kycStatus || 'Pending',
    });

    if (res.success) {
      setProfileModalOpen(false);
      setSensitiveOtpModalOpen(false);
      setProfileSuccess('Profile and statutory tax credentials updated successfully.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } else {
      setProfileError(res.message);
    }
  };

  // Address Handlers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrType('Home');
    setAddrStreet('');
    setAddrCity('');
    setAddrState('');
    setAddrPincode('');
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setAddrType(addr.type);
    setAddrStreet(addr.street);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (addrPincode.trim().startsWith('9')) {
      alert('Pincodes starting with 9 are outside our high-value armoured transit routes.');
      return;
    }

    const addrObj = {
      id: editingAddressId || `addr-${Date.now()}`,
      type: addrType,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      isDefault: editingAddressId ? false : (currentCustomer?.addresses.length === 0),
    };

    updateCustomerAddress(addrObj);
    setAddressModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    deleteCustomerAddress(id);
  };

  // Return Request Submit
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !returnReason.trim()) return;

    submitReturnRequest(selectedOrderId, returnReason.trim());
    setReturnSuccessMessage(`Return request for order #${selectedOrderId} submitted to administrator queue.`);
    setReturnReason('');
    setTimeout(() => setReturnSuccessMessage(null), 6000);
  };

  // Send Invoice Email simulation
  const handleResendInvoiceEmail = (invoiceNum: string, email: string) => {
    setInvoiceEmailToast(`Legal Tax Invoice #${invoiceNum} queued and dispatched to ${email}.`);
    setTimeout(() => setInvoiceEmailToast(null), 5000);
  };

  // If customer is not authenticated, show the login / registration form
  if (!currentCustomer) {
    return (
      <div className="space-y-8 max-w-xl mx-auto py-8">
        <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
          <span className="text-[#5A4630] font-medium">Customer Sign-In</span>
        </nav>

        <Card variant="surface" className="p-8 border-[#EADFC8] space-y-6 shadow-[0_4px_24px_rgba(90,70,48,0.06)]">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#F8EFD9] border border-[#C9A24B] flex items-center justify-center mx-auto text-[#C9A24B]">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#5A4630]">
              Sovereign Investor Access
            </h1>
            <p className="text-xs text-[#7A6A55]">
              Secure authentication via 6-digit one-time password (OTP). Regulated under DPDP Act 2023.
            </p>
          </div>

          {otpError && (
            <div className="p-3.5 bg-[#F7D4CF] border border-[#E89E95] rounded-lg text-xs text-[#8C2E24] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{otpError}</span>
            </div>
          )}

          {otpSuccessMsg && (
            <div className="p-3.5 bg-[#DCE8D5] border border-[#A4C997] rounded-lg text-xs text-[#2D5A27] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{otpSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerifyLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#5A4630] font-medium mb-1">
                Mobile Number or Email
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={loginContact}
                  onChange={(e) => setLoginContact(e.target.value)}
                  disabled={otpRequested}
                  placeholder="+91 98200 11223 or user@domain.com"
                  className="flex-1 px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                />
                {!otpRequested ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleRequestOtp}
                  >
                    Send OTP
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOtpRequested(false)}
                  >
                    Edit
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-[#7A6A55] mt-1">
                Statutory rule: Maximum 3 OTP requests per minute enforced for security.
              </p>
            </div>

            {otpRequested && (
              <>
                <div>
                  <label className="block text-[#5A4630] font-medium mb-1">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    placeholder="Enter 6-digit OTP (e.g. 789012)"
                    className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] font-mono tracking-widest text-base text-center"
                  />
                  <p className="text-[10px] text-[#7A6A55] mt-1 text-center">
                    Simulated OTP sent to your contact. Any 6 digits will be accepted.
                  </p>
                </div>

                <div>
                  <label className="block text-[#5A4630] font-medium mb-1">
                    Investor Full Name
                  </label>
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="e.g. Vikramaditya Singhania"
                    className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                  />
                </div>

                {/* DPDP Act Consent Checkbox */}
                <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dpdpConsent}
                      onChange={(e) => setDpdpConsent(e.target.checked)}
                      className="mt-0.5 text-[#C9A24B] rounded"
                    />
                    <span className="text-[11px] text-[#5A4630] leading-relaxed">
                      <strong>Mandatory Consent (DPDP Act 2023):</strong> I consent to the collection and verification of my contact and tax details solely for high-value precious bullion delivery, assay certification, and statutory GST compliance.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="mt-0.5 text-[#C9A24B] rounded"
                    />
                    <span className="text-[11px] text-[#7A6A55]">
                      Receive precious metal market trend advisories and festive catalogue previews.
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={!dpdpConsent}
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  Verify OTP & Access Account
                </Button>
              </>
            )}
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-4 border-t border-[#EADFC8] text-center space-y-3">
            <span className="text-[11px] text-[#7A6A55] block">
              Quick Prototype Access:
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={handleQuickDemoLogin}
            >
              Sign In with Sample Verified Investor Profile
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate Cumulative Portfolio Spent
  const cumulativePortfolio = customerOrders.reduce(
    (acc, o) => acc + (o.paymentStatus === 'Success' ? o.totalAmount : 0),
    0
  );

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const containsBullion = selectedOrder?.items.some(
    (i) => i.category === 'gold' || i.category === 'silver'
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium">Customer Account & Dossier</span>
      </nav>

      {/* Success Notification */}
      {profileSuccess && (
        <div className="p-3.5 bg-[#DCE8D5] border border-[#A4C997] rounded-lg text-xs text-[#2D5A27] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {/* Account Overview Header Card */}
      <Card variant="surface" className="p-6 border-[#EADFC8] shadow-[0_4px_24px_rgba(90,70,48,0.06)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F8EFD9] border-2 border-[#C9A24B] flex items-center justify-center text-[#5A4630] font-serif text-2xl font-bold shrink-0 shadow-xs">
              {currentCustomer.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl font-bold text-[#5A4630]">{currentCustomer.name}</h1>
                <Badge variant={currentCustomer.kycStatus === 'Verified' || currentCustomer.kycStatus === 'verified' ? 'sage' : 'amber'} size="sm">
                  {currentCustomer.kycStatus === 'Verified' || currentCustomer.kycStatus === 'verified' ? 'Verified Investor (KYC Cleared)' : 'KYC Pending'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#7A6A55]">
                <span>{currentCustomer.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>Phone: {showMaskedPhone ? maskPhone(currentCustomer.phone) : currentCustomer.phone}</span>
                  <button
                    type="button"
                    onClick={() => setShowMaskedPhone(!showMaskedPhone)}
                    aria-label="Toggle phone masking"
                    className="text-[#7A6A55] hover:text-[#5A4630]"
                  >
                    {showMaskedPhone ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>PAN: {showMaskedPan ? maskPan(currentCustomer.panNumber || currentCustomer.pan) : (currentCustomer.panNumber || currentCustomer.pan)}</span>
                  <button
                    type="button"
                    onClick={() => setShowMaskedPan(!showMaskedPan)}
                    aria-label="Toggle PAN masking"
                    className="text-[#7A6A55] hover:text-[#5A4630]"
                  >
                    {showMaskedPan ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                </span>
                {currentCustomer.gstin && (
                  <>
                    <span>•</span>
                    <span>GSTIN: {maskGstin(currentCustomer.gstin)}</span>
                  </>
                )}
              </div>

              <p className="text-[11px] text-[#7A6A55]/80">
                Investor Member since {new Date(currentCustomer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between border-t lg:border-t-0 pt-4 lg:pt-0 border-[#EADFC8] gap-3">
            <div className="flex sm:flex-col items-start sm:items-end justify-between w-full">
              <span className="text-xs text-[#7A6A55]">Cumulative Portfolio Value</span>
              <div className="font-serif text-2xl font-bold text-[#5A4630] tabular-nums">
                {formatINR(cumulativePortfolio)}
              </div>
              <span className="text-[11px] text-[#7A6A55]">{customerOrders.length} Completed Orders</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEditProfile}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={customerLogout}
                leftIcon={<LogOut className="w-3.5 h-3.5 text-[#8C2E24]" />}
                className="text-[#8C2E24] hover:bg-[#F7D4CF]/30"
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 sm:gap-4 border-t border-[#EADFC8] mt-6 pt-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'invoices'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tax Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'certificates'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Purity Certificates & Dossiers</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'saved'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved & Wishlist ({savedForLater.length + wishlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Address Book ({currentCustomer.addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Consents & Privacy</span>
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'returns'
                ? 'border-[#C9A24B] text-[#5A4630]'
                : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Returns & Claims</span>
          </button>
        </div>
      </Card>

      {/* TAB 1: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#5A4630]">
              Consignment & Order History
            </h2>
            <span className="text-xs text-[#7A6A55]">
              Insured delivery via authorized logistics
            </span>
          </div>

          <div className="space-y-4">
            {customerOrders.length === 0 ? (
              <Card variant="surface" className="p-8 text-center space-y-3 border-[#EADFC8]">
                <p className="text-xs text-[#7A6A55]">No orders placed yet.</p>
                <Link to="/c/gold">
                  <Button variant="primary" size="sm">Explore Precious Metals</Button>
                </Link>
              </Card>
            ) : (
              customerOrders.map((order) => {
                const statusVariant =
                  order.status === 'Delivered'
                    ? 'sage'
                    : order.status === 'Dispatched'
                    ? 'gold'
                    : order.status === 'Return requested'
                    ? 'amber'
                    : 'neutral';

                return (
                  <Card key={order.id} variant="surface" className="p-5 border-[#EADFC8] space-y-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EADFC8]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#5A4630] text-sm">
                            {order.orderNumber}
                          </span>
                          <Badge variant={statusVariant} size="sm">
                            {order.status}
                          </Badge>
                          {order.isStorePickup && (
                            <Badge variant="gold" size="sm">
                              Store Vault Pickup
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-[#7A6A55]">
                          Ordered on {formatFullDateTime(order.createdAt)} • {order.items.length} items • Insured Transit
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[11px] text-[#7A6A55]">Order Total</span>
                          <div className="font-serif font-bold text-lg text-[#5A4630] tabular-nums">
                            {formatINR(order.totalAmount)}
                          </div>
                        </div>

                        <Link to={`/order/${order.id}`}>
                          <Button variant="secondary" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                            Track & Details
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Mini item list */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {order.items.map((it, idx) => (
                        <span key={idx} className="p-2 rounded bg-[#FFFBF3] border border-[#EADFC8] text-[#5A4630] flex items-center gap-2">
                          <span className="font-medium">{it.name}</span>
                          <span className="text-[10px] text-[#7A6A55]">x{it.quantity}</span>
                        </span>
                      ))}
                    </div>

                    {/* Return status notice if raised */}
                    {order.returnRequest && (
                      <div className="p-3 bg-[#FBE7B8] border border-[#E8C26E] rounded-md text-xs text-[#7A5310] flex items-center justify-between">
                        <span>
                          Return Request: <strong>{order.returnRequest.status}</strong> — "{order.returnRequest.reason}"
                        </span>
                        <span className="text-[11px]">Logged in Admin Queue</span>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TAX INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#5A4630]">
              Statutory Tax Invoices
            </h2>
            <span className="text-xs text-[#7A6A55]">
              GST compliant invoices with IRN and QR code
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerOrders
              .filter((o) => o.paymentStatus === 'Success' || o.erpInvoiceAttached)
              .map((order) => {
                const invoiceNum = order.erpInvoiceNumber || `INV-2026-${order.orderNumber.replace(/\D/g, '').slice(-4)}`;
                return (
                  <Card key={order.id} variant="surface" className="p-5 border-[#EADFC8] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#5A4630]">{invoiceNum}</span>
                      <Badge variant="sage" size="sm">Tax Invoice Issued</Badge>
                    </div>

                    <div className="text-xs text-[#7A6A55] space-y-1">
                      <p>Order Reference: <strong className="text-[#5A4630] font-mono">{order.orderNumber}</strong></p>
                      <p>Date: {formatFullDateTime(order.updatedAt || order.createdAt)}</p>
                      <p>Tax Structure: CGST 1.5% + SGST 1.5% (Precious Metals)</p>
                      <p className="font-serif font-bold text-sm text-[#5A4630] pt-1">
                        Invoice Total: {formatINR(order.totalAmount)}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#EADFC8] flex items-center justify-between">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setInvoiceModalOrder({ ...order, computedInvoiceNum: invoiceNum })}
                        leftIcon={<FileText className="w-3.5 h-3.5 text-[#C9A24B]" />}
                      >
                        View Legal Invoice
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResendInvoiceEmail(invoiceNum, currentCustomer.email)}
                        leftIcon={<Mail className="w-3.5 h-3.5" />}
                      >
                        Email Copy
                      </Button>
                    </div>
                  </Card>
                );
              })}
          </div>

          {invoiceEmailToast && (
            <div className="p-3.5 bg-[#DCE8D5] border border-[#A4C997] rounded-lg text-xs text-[#2D5A27] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{invoiceEmailToast}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PURITY CERTIFICATES & DOSSIERS */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#5A4630]">
              Assay Certicards & Hallmarking Dossiers
            </h2>
            <span className="text-xs text-[#7A6A55]">
              Serialized authenticity proofs linked to purchased articles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {customerOrders
              .flatMap((o) => o.items)
              .map((it, idx) => {
                const prod = products.find((p) => p.id === it.productId);
                const certNum = prod?.certificate?.number || prod?.certificate?.certNumber || `AUR-ASSAY-2026-${idx + 101}`;
                const agency = prod?.certificate?.issuer || prod?.certificate?.agency || (it.category === 'gold' ? 'BIS Hallmark / MMTC-PAMP' : 'IGI Laboratory');

                return (
                  <Card key={idx} variant="surface" className="p-5 border-[#EADFC8] space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="gold" size="sm">99.9% Pure Assay</Badge>
                        <Award className="w-4 h-4 text-[#C9A24B]" />
                      </div>
                      <h4 className="font-medium text-xs text-[#5A4630] line-clamp-1">{it.name}</h4>
                      <div className="text-[11px] text-[#7A6A55] space-y-0.5">
                        <p>Authority: <strong>{agency}</strong></p>
                        <p className="font-mono">Cert #: {certNum}</p>
                        <p>Fineness: {it.category === 'gold' ? '24K (999 Purity)' : '999 Fine Silver'}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#EADFC8]">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => setCertModalItem({ item: it, certNum, agency, product: prod })}
                        leftIcon={<Award className="w-3.5 h-3.5 text-[#C9A24B]" />}
                      >
                        Inspect Certicard
                      </Button>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: SAVED FOR LATER & WISHLIST */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {/* Saved For Later */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#5A4630] flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#C9A24B]" />
              Saved For Later ({savedForLater.length})
            </h2>

            {savedForLater.length === 0 ? (
              <p className="text-xs text-[#7A6A55] italic">No items currently saved for later.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedForLater.map((it) => {
                  const prod = products.find((p) => p.id === it.productId);
                  if (!prod) return null;
                  return (
                    <Card key={it.productId} variant="surface" className="p-4 border-[#EADFC8] space-y-3">
                      <div className="flex gap-3">
                        <img
                          src={prod.imageUrl || `/products/${prod.id}.jpg`}
                          alt={prod.name}
                          className="w-14 h-14 object-cover rounded-lg border border-[#EADFC8]"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-xs text-[#5A4630] line-clamp-1">{prod.name}</p>
                          <p className="text-[10px] text-[#7A6A55] font-mono">Qty: {it.quantity}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-[#EADFC8]">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => moveSavedToCart(it.productId)}
                        >
                          Move to Cart
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSavedForLater(it.productId)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#8C2E24]" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Wishlist */}
          <div className="space-y-3 pt-4 border-t border-[#EADFC8]">
            <h2 className="font-serif text-lg font-bold text-[#5A4630]">
              Wishlisted Articles ({wishlist.length})
            </h2>
            {wishlist.length === 0 ? (
              <p className="text-xs text-[#7A6A55] italic">No articles bookmarked in wishlist.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {wishlist.map((prodId) => {
                  const prod = products.find((p) => p.id === prodId);
                  if (!prod) return null;
                  return (
                    <Card key={prod.id} variant="surface" className="p-4 border-[#EADFC8] space-y-3">
                      <div className="flex gap-3">
                        <img
                          src={prod.imageUrl || `/products/${prod.id}.jpg`}
                          alt={prod.name}
                          className="w-14 h-14 object-cover rounded-lg border border-[#EADFC8]"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-xs text-[#5A4630] line-clamp-1">{prod.name}</p>
                          <Badge variant="gold" size="sm">{prod.category.toUpperCase()}</Badge>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-[#EADFC8]">
                        <Link to={`/p/${prod.slug || prod.id}`} className="flex-1">
                          <Button variant="secondary" size="sm" className="w-full">
                            View Piece
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWishlist(prod.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#8C2E24]" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ADDRESS BOOK */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#5A4630]">
              Saved Insured Delivery Destinations
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddAddress}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add New Address
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentCustomer.addresses.map((addr) => (
              <Card key={addr.id} variant="surface" className="p-5 border-[#EADFC8] space-y-3 relative">
                <div className="flex items-center justify-between">
                  <Badge variant={addr.type === 'Home' ? 'gold' : 'neutral'} size="sm">
                    {addr.type}
                  </Badge>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-[#2D5A27] bg-[#DCE8D5] px-2 py-0.5 rounded">
                      Default Transit Destination
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#5A4630] space-y-1">
                  <p className="font-semibold">{currentCustomer.name}</p>
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-[#7A6A55]">Recipient Phone: {currentCustomer.phone}</p>
                </div>

                <div className="pt-3 border-t border-[#EADFC8] flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => handleOpenEditAddress(addr)}
                    className="p-1.5 text-[#7A6A55] hover:text-[#5A4630] flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 text-[#7A6A55] hover:text-[#8C2E24] flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: COMMUNICATION & CONSENT PREFERENCES */}
      {activeTab === 'preferences' && (
        <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6">
          <div className="space-y-1 pb-4 border-b border-[#EADFC8]">
            <h2 className="font-serif text-xl font-bold text-[#5A4630]">
              DPDP Act 2023 Statutory Consents & Alert Channels
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Configure which transaction notifications and spot market briefings you consent to receive.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl">
              <div>
                <strong className="text-[#5A4630] block text-sm">Market Trend Briefings & Editorial</strong>
                <p className="text-[#7A6A55] text-xs">Receive weekly gold and silver spot market analyses and festive previews.</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={currentCustomer.consents?.marketing ?? true}
                className="w-4 h-4 text-[#C9A24B] rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl">
              <div>
                <strong className="text-[#5A4630] block text-sm">Transactional SMS & OTP Verification</strong>
                <p className="text-[#7A6A55] text-xs">Mandatory dispatch notifications and courier OTP verification messages.</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={currentCustomer.consents?.smsAlerts ?? true}
                className="w-4 h-4 text-[#C9A24B] rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl">
              <div>
                <strong className="text-[#5A4630] block text-sm">WhatsApp Real-Time Order Tracking</strong>
                <p className="text-[#7A6A55] text-xs">Receive live courier tracking links and assay verification PDF copies on WhatsApp.</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={currentCustomer.consents?.whatsappUpdates ?? true}
                className="w-4 h-4 text-[#C9A24B] rounded"
              />
            </div>
          </div>

          <div className="pt-2 text-xs text-[#2D5A27] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Digital Personal Data Protection (DPDP Act) records maintained in compliance ledger.</span>
          </div>
        </Card>
      )}

      {/* TAB 7: CANCEL & RETURN REQUEST */}
      {activeTab === 'returns' && (
        <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6">
          <div className="space-y-1 pb-4 border-b border-[#EADFC8]">
            <h2 className="font-serif text-xl font-bold text-[#5A4630]">
              Post-Delivery Cancellation, Return or Buyback Request
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Submit cancellation or verification discrepancy requests directly to the administrative audit queue.
            </p>
          </div>

          {returnSuccessMessage && (
            <div className="p-4 bg-[#DCE8D5] border border-[#A4C997] rounded-xl text-xs text-[#2D5A27] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{returnSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleReturnSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block text-[#5A4630] font-semibold mb-1">
                Select Order for Return / Cancellation
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] font-medium"
              >
                {customerOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} ({o.status} • {formatINR(o.totalAmount)})
                  </option>
                ))}
              </select>
            </div>

            {containsBullion && (
              <div className="p-4 bg-[#FBE7B8] border border-[#E8C26E] rounded-xl text-xs text-[#7A5310] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-[#7A5310]" />
                  <span>Bullion Return & Buyback Advisory</span>
                </div>
                <p>
                  This order contains investment gold/silver bullion. Standard 7-day return applies to non-bullion artefacts. Bullion returns require assayer tamper-seal verification.
                </p>
              </div>
            )}

            <div>
              <label className="block text-[#5A4630] font-semibold mb-1">
                Reason for Return, Replacement, or Buyback
              </label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                required
                rows={4}
                placeholder="Please describe the issue (e.g. tamper-evident seal discrepancy, assay question, transit damage)..."
                className="w-full px-3 py-2.5 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] placeholder:text-[#7A6A55]/60 focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!returnReason.trim()}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Submit Request to Authorization Queue
            </Button>
          </form>
        </Card>
      )}

      {/* Profile Edit Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="Edit Sovereign Investor Profile"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          {profileError && (
            <div className="p-3 bg-[#F7D4CF] border border-[#E89E95] rounded-md text-xs text-[#8C2E24] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{profileError}</span>
            </div>
          )}

          <div>
            <label className="block text-[#5A4630] font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#5A4630] font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                value={editDob}
                onChange={(e) => setEditDob(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
              />
            </div>
            <div>
              <label className="block text-[#5A4630] font-medium mb-1">Anniversary</label>
              <input
                type="date"
                value={editAnniversary}
                onChange={(e) => setEditAnniversary(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#5A4630] font-medium mb-1">
              PAN Number (Statutory Format: 5 Letters, 4 Digits, 1 Letter)
            </label>
            <input
              type="text"
              value={editPan}
              onChange={(e) => setEditPan(e.target.value.toUpperCase())}
              maxLength={10}
              placeholder="e.g. ABCDE1234F"
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] font-mono uppercase"
            />
            <p className="text-[10px] text-[#7A6A55] mt-1">
              Mandatory for transactions exceeding ₹2,00,000 under Income Tax Rule 114B.
            </p>
          </div>

          <div>
            <label className="block text-[#5A4630] font-medium mb-1">
              GSTIN (Corporate / Enterprise Tax ID)
            </label>
            <input
              type="text"
              value={editGstin}
              onChange={(e) => setEditGstin(e.target.value.toUpperCase())}
              maxLength={15}
              placeholder="e.g. 27AAACA1234F1Z8"
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] font-mono uppercase"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#EADFC8]">
            <Button variant="outline" size="sm" type="button" onClick={() => setProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Sensitive Changes OTP Modal */}
      <Modal
        isOpen={sensitiveOtpModalOpen}
        onClose={() => setSensitiveOtpModalOpen(false)}
        title="Verify Sensitive Tax Credential Change"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#7A6A55]">
            Modifying statutory tax records (PAN / GSTIN) requires identity confirmation. Enter the 6-digit OTP sent to your primary mobile number.
          </p>

          <input
            type="text"
            value={sensitiveOtpInput}
            onChange={(e) => setSensitiveOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            placeholder="Enter 6-digit OTP (e.g. 123456)"
            className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] font-mono tracking-widest text-center text-lg"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setSensitiveOtpModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={sensitiveOtpInput.length !== 6}
              onClick={() => {
                applyProfileUpdate();
              }}
            >
              Confirm Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Address Form Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title={editingAddressId ? 'Edit Delivery Destination' : 'Add New Delivery Destination'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-[#5A4630]">
              <input
                type="radio"
                name="addrTypeRadio"
                checked={addrType === 'Home'}
                onChange={() => setAddrType('Home')}
                className="text-[#C9A24B]"
              />
              <span>Residential Vault</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-[#5A4630]">
              <input
                type="radio"
                name="addrTypeRadio"
                checked={addrType === 'Office'}
                onChange={() => setAddrType('Office')}
                className="text-[#C9A24B]"
              />
              <span>Corporate Headquarters</span>
            </label>
          </div>

          <div>
            <label className="block text-[#5A4630] font-medium mb-1">Street Address</label>
            <input
              type="text"
              value={addrStreet}
              onChange={(e) => setAddrStreet(e.target.value)}
              required
              placeholder="Apartment, Street"
              className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#5A4630] font-medium mb-1">City</label>
              <input
                type="text"
                value={addrCity}
                onChange={(e) => setAddrCity(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
              />
            </div>
            <div>
              <label className="block text-[#5A4630] font-medium mb-1">State</label>
              <input
                type="text"
                value={addrState}
                onChange={(e) => setAddrState(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
              />
            </div>
            <div>
              <label className="block text-[#5A4630] font-medium mb-1">Pincode</label>
              <input
                type="text"
                value={addrPincode}
                onChange={(e) => setAddrPincode(e.target.value)}
                maxLength={6}
                required
                placeholder="e.g. 400026"
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
              />
            </div>
          </div>

          <p className="text-[10px] text-[#7A6A55]">
            Note: Pincodes starting with "9" are unserviceable for high-value armoured transit.
          </p>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Destination
            </Button>
          </div>
        </form>
      </Modal>

      {/* Tax Invoice Full Modal */}
      {invoiceModalOrder && (
        <Modal
          isOpen={!!invoiceModalOrder}
          onClose={() => setInvoiceModalOrder(null)}
          title={`Legal Tax Invoice #${invoiceModalOrder.computedInvoiceNum}`}
          maxWidth="lg"
          footer={
            <Button variant="secondary" size="sm" onClick={() => setInvoiceModalOrder(null)}>
              Close
            </Button>
          }
        >
          <div className="p-6 bg-[#FFFFFF] border border-[#EADFC8] rounded-xl space-y-4 text-xs text-[#5A4630]">
            <div className="flex justify-between items-start border-b border-[#EADFC8] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#5A4630]">AURUM & CO PRECIOUS METALS LTD</h3>
                <p className="text-[11px] text-[#7A6A55]">GSTIN: 27AAACA1234F1Z8 • BIS Hallmark Ref: HM/L-7890123</p>
                <p className="text-[10px] text-[#7A6A55] font-mono mt-0.5">IRN: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm block">{invoiceModalOrder.computedInvoiceNum}</span>
                <p className="text-[11px] text-[#7A6A55]">Date: {formatFullDateTime(invoiceModalOrder.updatedAt || invoiceModalOrder.createdAt)}</p>
                <div className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#2D5A27] bg-[#DCE8D5] px-1.5 py-0.5 rounded font-mono">
                  <QrCode className="w-3 h-3" />
                  <span>NIC e-Invoice QR Verified</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-[#FFFBF3] p-3 rounded-lg border border-[#EADFC8]">
              <div>
                <span className="font-semibold text-[#5A4630]">Billed To:</span>
                <p>{invoiceModalOrder.customerName}</p>
                <p>{invoiceModalOrder.customerEmail}</p>
                <p>PAN: {invoiceModalOrder.customerPan || currentCustomer.panNumber || currentCustomer.pan || 'Available in Profile'}</p>
                <p>{invoiceModalOrder.shippingAddress?.street}, {invoiceModalOrder.shippingAddress?.city} - {invoiceModalOrder.shippingAddress?.pincode}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-[#5A4630]">Consignment Reference:</span>
                <p className="font-mono">{invoiceModalOrder.orderNumber}</p>
                <p>Status: Payment Confirmed & Reconciled</p>
                <p>Courier: {invoiceModalOrder.courierName || 'Sequel Armoured Express'}</p>
              </div>
            </div>

            <div className="border border-[#EADFC8] rounded-lg overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-xs">
                <thead>
                  <tr className="bg-[#F8EFD9] text-[#5A4630] font-semibold">
                    <th className="p-2.5">Article Description</th>
                    <th className="p-2.5">HSN</th>
                    <th className="p-2.5 text-center">Tax Split</th>
                    <th className="p-2.5 text-right">Total (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceModalOrder.items?.map((it: any, idx: number) => (
                    <tr key={idx} className="border-t border-[#EADFC8]">
                      <td className="p-2.5 font-medium">{it.name} (Qty: {it.quantity})</td>
                      <td className="p-2.5 font-mono">{it.category === 'gold' ? '710812' : '711319'}</td>
                      <td className="p-2.5 text-center text-[#7A6A55]">CGST 1.5% + SGST 1.5%</td>
                      <td className="p-2.5 text-right font-serif font-bold">{formatINR(it.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-[#EADFC8]">
              <span className="font-serif font-bold text-sm">Invoice Grand Total (INR)</span>
              <span className="font-serif font-bold text-2xl text-[#5A4630] tabular-nums">
                {formatINR(invoiceModalOrder.totalAmount)}
              </span>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  alert(`Invoice #${invoiceModalOrder.computedInvoiceNum} downloaded successfully as an encrypted PDF.`);
                  setInvoiceModalOrder(null);
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download Legal PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  handleResendInvoiceEmail(invoiceModalOrder.computedInvoiceNum, currentCustomer.email);
                  setInvoiceModalOrder(null);
                }}
                leftIcon={<Mail className="w-3.5 h-3.5" />}
              >
                Email Invoice Copy
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Certicard Inspector Modal */}
      {certModalItem && (
        <Modal
          isOpen={!!certModalItem}
          onClose={() => setCertModalItem(null)}
          title={`Assay Certicard: ${certModalItem.item.name}`}
          maxWidth="md"
        >
          <div className="p-6 bg-gradient-to-br from-[#FFFBF3] via-[#F8EFD9] to-[#EADFC8] rounded-xl border border-[#C9A24B] shadow-inner space-y-5 text-xs text-[#5A4630]">
            <div className="flex justify-between items-start pb-3 border-b border-[#C9A24B]/40">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A6A55] block">
                  Official Assay Certificate
                </span>
                <h3 className="font-serif text-lg font-bold text-[#5A4630]">AURUM SECURE CERTIPACK™</h3>
              </div>
              <div className="w-10 h-10 rounded-full border border-[#C9A24B] bg-[#FFFBF3] flex items-center justify-center text-[#C9A24B] font-serif font-bold">
                Au
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-white/70 backdrop-blur-xs p-4 rounded-lg border border-[#C9A24B]/30">
              <div>
                <span className="text-[#7A6A55] block">Article Designation:</span>
                <strong className="text-sm">{certModalItem.item.name}</strong>
              </div>
              <div>
                <span className="text-[#7A6A55] block">Fineness Purity:</span>
                <strong className="text-sm">999.9 Fine 24 Karat</strong>
              </div>
              <div>
                <span className="text-[#7A6A55] block">Assay Certificate Ref:</span>
                <strong className="font-mono text-sm">{certModalItem.certNum}</strong>
              </div>
              <div>
                <span className="text-[#7A6A55] block">Accrediting Laboratory:</span>
                <strong>{certModalItem.agency}</strong>
              </div>
            </div>

            <div className="p-3 bg-[#DCE8D5]/60 border border-[#A4C997] rounded-md text-[11px] text-[#2D5A27] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                <span>Tamper-evident holographic certicard blister intact</span>
              </span>
              <span className="font-mono text-[10px]">SECURITY SEAL: ACTIVE</span>
            </div>

            <div className="text-center pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  alert(`Certificate #${certModalItem.certNum} dossier exported.`);
                  setCertModalItem(null);
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download Purity Dossier (PDF)
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
