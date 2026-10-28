import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { calculatePrice, formatINR } from '../lib/pricing';
import { evaluateCoupon } from '../lib/couponEngine';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  QrCode,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Headphones,
  Store,
  Truck,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const STORE_PICKUP_LOCATIONS = [
  {
    id: 'vault-mumbai',
    name: 'Mumbai Sovereign Vault',
    address: 'Ground Floor, Heritage Quarter, Horniman Circle, Fort, Mumbai 400001',
    timing: 'Mon–Sat: 10:30 AM – 7:30 PM (Biometric & Govt ID required)',
  },
  {
    id: 'vault-delhi',
    name: 'New Delhi Connaught Vault',
    address: 'Regal Building, Barakhamba Road, Connaught Place, New Delhi 110001',
    timing: 'Mon–Sat: 10:30 AM – 7:30 PM (Biometric & Govt ID required)',
  },
  {
    id: 'vault-bengaluru',
    name: 'Bengaluru MG Road Vault',
    address: 'Trinity Circle, MG Road, Bengaluru 560001',
    timing: 'Mon–Sat: 10:30 AM – 7:30 PM (Biometric & Govt ID required)',
  },
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemoUrl = searchParams.get('demo') === '1';

  const {
    cart,
    products,
    rates,
    pricingConfig,
    activeCoupon,
    authenticatedCustomer,
    kycThreshold,
    createOrderFromCart,
    simulateDuplicateWebhook,
  } = useAppStore();

  useSEO({
    title: 'Secure Checkout & Insured Transit',
    description: 'Complete your order with high-value insured transit and bank-grade payment encryption.',
    canonicalPath: '/checkout',
  });

  // Fulfilment mode: Delivery vs Store Vault Pickup
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedPickupLocation, setSelectedPickupLocation] = useState(STORE_PICKUP_LOCATIONS[0].name);

  // Guest vs Registered customer toggle
  const [isRegistered, setIsRegistered] = useState(!!authenticatedCustomer);

  // Form Fields
  const [name, setName] = useState(authenticatedCustomer?.name || 'Vikramaditya Singhania');
  const [email, setEmail] = useState(authenticatedCustomer?.email || 'vikram.singhania@heritage.in');
  const [phone, setPhone] = useState(authenticatedCustomer?.phone || '+91 98200 11223');
  const [street, setStreet] = useState(authenticatedCustomer?.addresses[0]?.street || '72 Altamount Road, Cumballa Hill');
  const [city, setCity] = useState(authenticatedCustomer?.addresses[0]?.city || 'Mumbai');
  const [state, setState] = useState(authenticatedCustomer?.addresses[0]?.state || 'Maharashtra');
  const [pincode, setPincode] = useState(authenticatedCustomer?.addresses[0]?.pincode || '400026');

  // Statutory PAN & GSTIN
  const [panNumber, setPanNumber] = useState(authenticatedCustomer?.panNumber || authenticatedCustomer?.pan || 'ABCDE1234F');
  const [gstin, setGstin] = useState(authenticatedCustomer?.gstin || '');

  // Statutory terms agreement checkbox
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Carrier selection
  const [courier, setCourier] = useState<'Sequel' | 'BVC'>('Sequel');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'netbanking' | 'upi' | 'card' | 'wire'>('netbanking');

  // Demo Outcome Selector (default Success)
  const [demoPaymentResult, setDemoPaymentResult] = useState<'Success' | 'Failed' | 'Pending' | 'Timeout'>('Success');
  const [duplicateWebhookToast, setDuplicateWebhookToast] = useState<string | null>(null);

  // Payment State Machine: 'idle' | 'processing' | 'failed' | 'pending' | 'timeout'
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'failed' | 'pending' | 'timeout'>('idle');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Price Lock Expiry Simulation Gate
  const [priceLockSecondsLeft, setPriceLockSecondsLeft] = useState<number>(300); // 5 min lock
  const [priceLockExpired, setPriceLockExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPriceLockSecondsLeft((prev) => {
        if (prev <= 1) {
          setPriceLockExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshPriceLock = () => {
    setPriceLockSecondsLeft(300);
    setPriceLockExpired(false);
  };

  // Pincode Serviceability Check: Pincodes starting with 9 are NOT serviceable (only applies for delivery mode)
  const isPincodeServiceable =
    deliveryMode === 'pickup' ||
    (!pincode.trim().startsWith('9') && pincode.trim().length >= 6);
  const isPincodeBlocked = deliveryMode === 'delivery' && pincode.trim().startsWith('9');

  // Pre-fill registered details on toggle
  const handleToggleRegistered = (registered: boolean) => {
    setIsRegistered(registered);
    if (registered) {
      setName(authenticatedCustomer?.name || 'Vikramaditya Singhania');
      setEmail(authenticatedCustomer?.email || 'vikram.singhania@heritage.in');
      setPhone(authenticatedCustomer?.phone || '+91 98200 11223');
      setStreet(authenticatedCustomer?.addresses[0]?.street || '72 Altamount Road, Cumballa Hill');
      setCity(authenticatedCustomer?.addresses[0]?.city || 'Mumbai');
      setState(authenticatedCustomer?.addresses[0]?.state || 'Maharashtra');
      setPincode(authenticatedCustomer?.addresses[0]?.pincode || '400026');
      setPanNumber(authenticatedCustomer?.panNumber || authenticatedCustomer?.pan || 'ABCDE1234F');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setStreet('');
      setCity('');
      setState('');
      setPincode('');
      setPanNumber('');
    }
  };

  // Cart totals calculation
  let subtotal = 0;
  let totalGst = 0;
  let rawTotal = 0;

  const orderItems = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return null;
    const calc = calculatePrice(product, rates, pricingConfig);
    subtotal += calc.subtotal * item.quantity;
    totalGst += calc.gstAmount * item.quantity;
    rawTotal += calc.total * item.quantity;
    return { product, item, calc };
  }).filter(Boolean);

  // Evaluate coupon discount
  let couponDiscount = 0;
  if (activeCoupon) {
    const couponInputItems = orderItems.map((entry) => ({
      category: entry!.product.category,
      subtotal: entry!.calc.total * entry!.item.quantity,
    }));
    const evalRes = evaluateCoupon(activeCoupon, rawTotal, couponInputItems);
    if (evalRes.isValid) {
      couponDiscount = evalRes.discountAmount;
    }
  }

  const grandTotal = Math.max(0, rawTotal - couponDiscount);

  // Statutory PAN Requirement Evaluation (Rule 3: threshold ₹2,00,000)
  const isPanRequired = grandTotal >= kycThreshold;
  const isPanValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.trim().toUpperCase());
  const hasKycHold = isPanRequired && !isPanValid;

  // Can submit order?
  const isCheckoutDisabled =
    !isPincodeServiceable ||
    priceLockExpired ||
    !agreeTerms ||
    (isPanRequired && !panNumber.trim());

  // Simulate Duplicate Webhook Callback
  const handleSimulateDuplicateWebhook = () => {
    const testOrderId = createdOrderId || 'ORD-2026-001';
    const res = simulateDuplicateWebhook(testOrderId, 'Payment Gateway Webhook');
    setDuplicateWebhookToast(res.message);
    setTimeout(() => setDuplicateWebhookToast(null), 6000);
  };

  // Submit Order / Payment Simulation
  const handlePlaceOrder = () => {
    if (isCheckoutDisabled) return;

    setPaymentState('processing');

    setTimeout(() => {
      const shippingInfo = {
        customerId: authenticatedCustomer?.id || 'cust-01',
        name: name || 'Guest Customer',
        email: email || 'customer@aurum.internal',
        phone: phone || '+91 99999 88888',
        pan: panNumber.trim().toUpperCase() || undefined,
        gstin: gstin.trim().toUpperCase() || undefined,
        kycStatus: isPanValid ? 'verified' : 'unverified',
        isStorePickup: deliveryMode === 'pickup',
        pickupLocation: deliveryMode === 'pickup' ? selectedPickupLocation : undefined,
        address: {
          name: name || 'Customer',
          street: deliveryMode === 'pickup' ? selectedPickupLocation : street,
          city: deliveryMode === 'pickup' ? 'Vault Collection' : city,
          state: deliveryMode === 'pickup' ? 'India' : state,
          pincode: deliveryMode === 'pickup' ? '400001' : pincode,
          country: 'India',
        },
      };

      const selectedPaymentLabel =
        paymentMethod === 'netbanking'
          ? 'NetBanking (HDFC Priority)'
          : paymentMethod === 'upi'
          ? 'UPI (Instant Transfer)'
          : paymentMethod === 'card'
          ? 'Credit Card'
          : 'Wire Transfer / RTGS';

      if (demoPaymentResult === 'Success') {
        const order = createOrderFromCart(shippingInfo, selectedPaymentLabel, 'Success');
        setPaymentState('idle');
        navigate(`/order/${order.id}`);
      } else if (demoPaymentResult === 'Failed') {
        setPaymentState('failed');
      } else if (demoPaymentResult === 'Pending') {
        const order = createOrderFromCart(shippingInfo, `${selectedPaymentLabel} (Pending)`, 'Pending');
        setCreatedOrderId(order.id);
        setPaymentState('pending');
      } else if (demoPaymentResult === 'Timeout') {
        setPaymentState('timeout');
      }
    }, 1200);
  };

  // If cart is empty, redirect or prompt
  if (cart.length === 0 && paymentState === 'idle') {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <h1 className="font-serif text-2xl font-bold text-[#5A4630]">Your Cart is Empty</h1>
        <p className="text-xs text-[#7A6A55]">
          Please add precious bullion or jewellery items to your cart before proceeding to checkout.
        </p>
        <Link to="/c/gold">
          <Button variant="primary" size="md">Explore Gold Bullion</Button>
        </Link>
      </div>
    );
  }

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <Link to="/cart" className="hover:text-[#C9A24B]">Cart</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium">Secure Checkout</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#EADFC8] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630] flex items-center gap-2.5">
            <Lock className="w-7 h-7 text-[#C9A24B]" />
            Secure Order Checkout
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A55] mt-1">
            Complete delivery and compliance specifications. Transactions protected under high-value vault custody.
          </p>
        </div>

        {/* Demo Mode & Duplicate Webhook Simulator Controls */}
        {isDemoUrl && (
          <div className="p-3 bg-[#F1E3BD] border border-[#C9A24B] rounded-xl text-xs space-y-2 shadow-xs">
            <div className="font-bold text-[#5A4630] flex items-center justify-between gap-2">
              <span>Demo Mode (?demo=1)</span>
              <Badge variant="gold" size="sm">Simulator</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#7A6A55]">Simulate Outcome:</span>
              <select
                value={demoPaymentResult}
                onChange={(e) => setDemoPaymentResult(e.target.value as any)}
                aria-label="Demo payment outcome selector"
                className="bg-white border border-[#EADFC8] text-xs font-semibold text-[#5A4630] rounded px-2 py-1"
              >
                <option value="Success">Success (Confirmed)</option>
                <option value="Failed">Failed (Bank Decline)</option>
                <option value="Pending">Pending (Verification)</option>
                <option value="Timeout">Timeout (Session Expiry)</option>
              </select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-[11px] bg-white"
              onClick={handleSimulateDuplicateWebhook}
            >
              Test Duplicate Webhook Idempotency
            </Button>
          </div>
        )}
      </div>

      {duplicateWebhookToast && (
        <div className="p-3.5 bg-[#DCE8D5] border border-[#A4C997] rounded-lg text-xs text-[#2D5A27] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{duplicateWebhookToast}</span>
        </div>
      )}

      {/* Live Rate Lock Status Strip */}
      <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs transition-colors ${
        priceLockExpired
          ? 'bg-[#F7D4CF] border-[#E89E95] text-[#8C2E24]'
          : 'bg-[#FFFBF3] border-[#EADFC8] text-[#5A4630]'
      }`}>
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${priceLockExpired ? 'text-[#8C2E24]' : 'text-[#C9A24B]'}`} />
          <span>
            {priceLockExpired ? (
              <strong>Live rate lock expired! Bullion prices must be refreshed to continue checkout.</strong>
            ) : (
              <span>Live spot rate locked for <strong>{formatTimer(priceLockSecondsLeft)}</strong>. Cryptographic snapshot guaranteed.</span>
            )}
          </span>
        </div>

        {priceLockExpired && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleRefreshPriceLock}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Price Lock
          </Button>
        )}
      </div>

      {/* Payment Processing Overlay */}
      {paymentState === 'processing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5A4630]/30 backdrop-blur-xs">
          <Card variant="surface" className="p-8 text-center max-w-md w-full space-y-4 border-[#EADFC8]">
            <div className="w-14 h-14 rounded-full bg-[#F8EFD9] border border-[#C9A24B] flex items-center justify-center mx-auto text-[#C9A24B] animate-spin">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#5A4630]">
              Connecting to Secure Payment Gateway...
            </h3>
            <p className="text-xs text-[#7A6A55]">
              Authorizing cryptographic snapshot and verifying insurance vault coverage. Please do not refresh.
            </p>
          </Card>
        </div>
      )}

      {/* Payment Result Views */}
      {paymentState === 'failed' && (
        <Card variant="surface" className="p-8 border-[#E89E95] bg-[#FFFBFB] text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#F7D4CF] border border-[#E89E95] flex items-center justify-center mx-auto text-[#8C2E24]">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#8C2E24]">
            Payment Declined / Failed
          </h2>
          <p className="text-xs text-[#7A6A55] leading-relaxed max-w-md mx-auto">
            Your bank declined the transaction or session timed out. Your items remain reserved in your cart. You may retry with another payment instrument.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="primary" onClick={() => setPaymentState('idle')}>
              Retry Payment
            </Button>
            <Link to="/support">
              <Button variant="secondary">Contact Concierge</Button>
            </Link>
          </div>
        </Card>
      )}

      {paymentState === 'pending' && (
        <Card variant="surface" className="p-8 border-[#E8C26E] bg-[#FFFDF5] text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FBE7B8] border border-[#E8C26E] flex items-center justify-center mx-auto text-[#7A5310]">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#7A5310]">
            Payment Verification Pending
          </h2>
          <p className="text-xs text-[#7A6A55] leading-relaxed max-w-md mx-auto">
            Your bank acknowledged the transfer request. Awaiting payment gateway settlement webhook confirmation.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {createdOrderId && (
              <Button variant="primary" onClick={() => navigate(`/order/${createdOrderId}`)}>
                View Order Status
              </Button>
            )}
            <Button variant="secondary" onClick={() => setPaymentState('idle')}>
              Return to Checkout
            </Button>
          </div>
        </Card>
      )}

      {paymentState === 'timeout' && (
        <Card variant="surface" className="p-8 border-[#EADFC8] text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#F8EFD9] border border-[#EADFC8] flex items-center justify-center mx-auto text-[#7A6A55]">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#5A4630]">
            Payment Session Timed Out
          </h2>
          <p className="text-xs text-[#7A6A55] leading-relaxed max-w-md mx-auto">
            The banking gateway response exceeded allowable security limits. Re-initiate transaction to safeguard current bullion rates.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="primary" onClick={() => setPaymentState('idle')}>
              Retry Transaction
            </Button>
            <Link to="/support">
              <Button variant="secondary" leftIcon={<Headphones className="w-4 h-4" />}>
                Customer Concierge
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Main Checkout Form */}
      {paymentState === 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details & Compliance */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Profile */}
            <Card variant="surface" className="p-5 border-[#EADFC8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
                <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider">
                  1. Investor Identity
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#7A6A55]">Account Type:</span>
                  <div className="inline-flex rounded-lg border border-[#EADFC8] bg-[#FFFBF3] p-0.5">
                    <button
                      type="button"
                      onClick={() => handleToggleRegistered(false)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        !isRegistered ? 'bg-[#C9A24B] text-white' : 'text-[#5A4630]'
                      }`}
                    >
                      Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleRegistered(true)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        isRegistered ? 'bg-[#C9A24B] text-white' : 'text-[#5A4630]'
                      }`}
                    >
                      Registered
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[#5A4630] font-medium mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Full Legal Name"
                    className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                  />
                </div>
                <div>
                  <label className="block text-[#5A4630] font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                  />
                </div>
                <div>
                  <label className="block text-[#5A4630] font-medium mb-1">Mobile Phone (OTP)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+91 98200 11223"
                    className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                  />
                </div>
              </div>
            </Card>

            {/* Step 2: Fulfilment Mode (Armoured Delivery vs Store Pickup) */}
            <Card variant="surface" className="p-5 border-[#EADFC8] space-y-4">
              <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider block pb-2 border-b border-[#EADFC8]">
                2. Fulfilment & Custody Selection
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-3.5 rounded-lg border cursor-pointer flex flex-col justify-between space-y-2 transition-all ${
                    deliveryMode === 'delivery'
                      ? 'bg-[#F8EFD9] border-[#C9A24B] shadow-xs'
                      : 'bg-white border-[#EADFC8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#5A4630] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#C9A24B]" />
                      Armoured Vault Transit
                    </span>
                    <input
                      type="radio"
                      name="deliveryModeRadio"
                      checked={deliveryMode === 'delivery'}
                      onChange={() => setDeliveryMode('delivery')}
                      className="text-[#C9A24B]"
                    />
                  </div>
                  <p className="text-[11px] text-[#7A6A55]">
                    100% Insured armoured courier straight to your door with OTP verification.
                  </p>
                </label>

                <label
                  className={`p-3.5 rounded-lg border cursor-pointer flex flex-col justify-between space-y-2 transition-all ${
                    deliveryMode === 'pickup'
                      ? 'bg-[#F8EFD9] border-[#C9A24B] shadow-xs'
                      : 'bg-white border-[#EADFC8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#5A4630] flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-[#C9A24B]" />
                      Store / Vault Pickup
                    </span>
                    <input
                      type="radio"
                      name="deliveryModeRadio"
                      checked={deliveryMode === 'pickup'}
                      onChange={() => setDeliveryMode('pickup')}
                      className="text-[#C9A24B]"
                    />
                  </div>
                  <p className="text-[11px] text-[#7A6A55]">
                    Collect in-person from our secure bullion vault lounges in Mumbai, Delhi, or Bengaluru.
                  </p>
                </label>
              </div>

              {/* Delivery Address Form (if delivery mode) */}
              {deliveryMode === 'delivery' ? (
                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">Street Address / Suite</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                      placeholder="Apartment, Street address"
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[#5A4630] font-medium mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#5A4630] font-medium mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#5A4630] font-medium mb-1">Postal Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        maxLength={6}
                        required
                        placeholder="e.g. 400026"
                        className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] font-mono"
                      />
                    </div>
                  </div>

                  {/* Serviceability Banner */}
                  {isPincodeBlocked ? (
                    <div className="p-3 bg-[#F7D4CF] border border-[#E89E95] rounded-md text-xs text-[#8C2E24] flex items-start gap-2">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Not Serviceable:</strong> PIN codes beginning with "9" are outside high-value armoured logistics routes. Select Store Pickup or provide an alternate destination.
                      </div>
                    </div>
                  ) : isPincodeServiceable ? (
                    <div className="p-2.5 bg-[#DCE8D5] border border-[#A4C997] rounded-md text-xs text-[#2D5A27] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Pincode <strong>{pincode}</strong> is serviceable for 100% insured armoured courier transit.</span>
                    </div>
                  ) : null}

                  {/* Courier Partner Selection */}
                  <div className="pt-2">
                    <label className="block text-[#5A4630] font-medium mb-1.5">Insured Logistics Carrier</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCourier('Sequel')}
                        className={`p-2.5 rounded-lg border text-left text-xs ${
                          courier === 'Sequel' ? 'bg-[#F8EFD9] border-[#C9A24B] font-bold text-[#5A4630]' : 'bg-white border-[#EADFC8] text-[#7A6A55]'
                        }`}
                      >
                        Sequel Secure Logistics
                      </button>
                      <button
                        type="button"
                        onClick={() => setCourier('BVC')}
                        className={`p-2.5 rounded-lg border text-left text-xs ${
                          courier === 'BVC' ? 'bg-[#F8EFD9] border-[#C9A24B] font-bold text-[#5A4630]' : 'bg-white border-[#EADFC8] text-[#7A6A55]'
                        }`}
                      >
                        BVC Armoured Vaulting
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Store Pickup Location Selector */
                <div className="space-y-3 pt-2 text-xs">
                  <label className="block text-[#5A4630] font-medium">Select Sovereign Vault Collection Point</label>
                  <div className="space-y-2">
                    {STORE_PICKUP_LOCATIONS.map((loc) => (
                      <label
                        key={loc.id}
                        className={`p-3 rounded-lg border cursor-pointer block transition-all ${
                          selectedPickupLocation === loc.name
                            ? 'bg-[#F8EFD9] border-[#C9A24B] shadow-xs'
                            : 'bg-white border-[#EADFC8]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#5A4630]">{loc.name}</span>
                          <input
                            type="radio"
                            name="storePickupLocationRadio"
                            checked={selectedPickupLocation === loc.name}
                            onChange={() => setSelectedPickupLocation(loc.name)}
                            className="text-[#C9A24B]"
                          />
                        </div>
                        <p className="text-[11px] text-[#7A6A55]">{loc.address}</p>
                        <p className="text-[10px] text-[#C9A24B] mt-0.5 font-medium">{loc.timing}</p>
                      </label>
                    ))}
                  </div>

                  <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[11px] text-[#7A6A55]">
                    ℹ️ <strong>Vault Protocol:</strong> Please present government-issued photo ID (PAN or Aadhaar) and your order OTP at the collection lounge.
                  </div>
                </div>
              )}
            </Card>

            {/* Step 3: Statutory PAN / KYC Compliance */}
            <Card variant="surface" className="p-5 border-[#EADFC8] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EADFC8]">
                <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider">
                  3. Statutory Tax & KYC Mandate
                </span>
                {isPanRequired && (
                  <Badge variant="amber" size="sm">Rule 114B Triggered (&gt; ₹2 Lakh)</Badge>
                )}
              </div>

              <div className="space-y-3 text-xs">
                {isPanRequired ? (
                  <div className="p-3 bg-[#FBE7B8] border border-[#E8C26E] rounded-md text-xs text-[#7A5310] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-[#7A5310]" />
                      <span>Statutory Mandate: Orders Exceeding ₹2,00,000</span>
                    </div>
                    <p>
                      Under <strong>Rule 114B of the Income Tax Rules</strong>, quoting a verified Permanent Account Number (PAN) is mandatory for purchase of bullion exceeding ₹2,00,000. Orders with unverified or missing PAN will be placed on KYC hold.
                    </p>
                  </div>
                ) : (
                  <p className="text-[#7A6A55] text-xs">
                    Order total is below the statutory ₹2,00,000 PAN threshold. Providing PAN is optional for personal tax records.
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">
                      Investor PAN {isPanRequired && <span className="text-[#8C2E24]">*</span>}
                    </label>
                    <input
                      type="text"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      maxLength={10}
                      placeholder="e.g. ABCDE1234F"
                      className={`w-full px-3 py-2 bg-white border rounded-md text-[#5A4630] font-mono uppercase ${
                        isPanRequired && !isPanValid
                          ? 'border-[#E89E95] focus:ring-[#8C2E24]'
                          : 'border-[#EADFC8]'
                      }`}
                    />
                    {panNumber.trim() && !isPanValid && (
                      <span className="text-[10px] text-[#8C2E24] mt-1 block">
                        Must match statutory format (5 letters, 4 numbers, 1 letter).
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#5A4630] font-medium mb-1">GSTIN (Optional Enterprise ID)</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      maxLength={15}
                      placeholder="e.g. 27AAACA1234F1Z8"
                      className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] font-mono uppercase"
                    />
                  </div>
                </div>

                {hasKycHold && (
                  <div className="p-2.5 bg-[#F7D4CF] border border-[#E89E95] rounded-md text-xs text-[#8C2E24] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Valid PAN required before checkout. Missing PAN will place order in <strong>kyc_missing</strong> hold status.</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Step 4: Payment Instrument Selection */}
            <Card variant="surface" className="p-5 border-[#EADFC8] space-y-4">
              <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider block pb-2 border-b border-[#EADFC8]">
                4. Payment Instrument
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {[
                  { id: 'netbanking', label: 'NetBanking', icon: Building2 },
                  { id: 'upi', label: 'UPI / QR', icon: QrCode },
                  { id: 'card', label: 'Credit Card', icon: CreditCard },
                  { id: 'wire', label: 'RTGS Wire', icon: ShieldCheck },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                        isSelected
                          ? 'bg-[#C9A24B] text-white border-[#C9A24B] shadow-xs font-semibold'
                          : 'bg-white border-[#EADFC8] text-[#5A4630] hover:bg-[#F8EFD9]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-md text-[11px] text-[#7A6A55]">
                🔒 <strong>Regulatory Notice:</strong> COD is not applicable for bullion & certified jewellery. High-value transactions are settled through authorized clearing banks with end-to-end encryption.
              </div>
            </Card>
          </div>

          {/* Right Column: Order Review & Confirmation */}
          <div className="lg:col-span-5 space-y-4">
            <Card variant="surface" className="p-6 border-[#EADFC8] space-y-5 shadow-[0_4px_24px_rgba(90,70,48,0.08)] sticky top-24">
              <h2 className="font-serif text-xl font-bold text-[#5A4630] pb-3 border-b border-[#EADFC8]">
                Final Order Review
              </h2>

              {/* Items List mini */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {orderItems.map((entry) => {
                  if (!entry) return null;
                  const { product, item, calc } = entry;
                  return (
                    <div key={product.id} className="flex justify-between items-center text-xs border-b border-[#EADFC8]/50 pb-2.5 gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#EADFC8] bg-[#FAF6EE] shrink-0 shadow-2xs">
                          <img
                            src={product.imageUrl || `/products/${product.id}.jpg`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 pr-1 space-y-0.5">
                          <div className="font-semibold text-[#5A4630] line-clamp-1">{product.name}</div>
                          <div className="text-[10px] text-[#7A6A55]">Qty: {item.quantity} × {formatINR(calc.total)}</div>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-[#5A4630] tabular-nums shrink-0">
                        {formatINR(calc.total * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 text-xs pt-2 border-t border-[#EADFC8]">
                <div className="flex justify-between text-[#7A6A55]">
                  <span>Subtotal:</span>
                  <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#7A6A55]">
                  <span>Insured Armoured Custody:</span>
                  <span className="tabular-nums font-semibold text-[#2D5A27]">Complimentary</span>
                </div>
                <div className="flex justify-between text-[#7A6A55]">
                  <span>GST (3% Statutory Split: CGST 1.5% + SGST 1.5%):</span>
                  <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(totalGst)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#2D5A27]">
                    <span>Promotional Voucher Discount:</span>
                    <span className="tabular-nums font-semibold">-{formatINR(couponDiscount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#EADFC8] flex items-baseline justify-between">
                  <span className="font-serif text-xl font-bold text-[#5A4630]">Grand Total</span>
                  <span className="font-serif text-3xl font-bold text-[#5A4630] tabular-nums">
                    {formatINR(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Statutory Terms Checkbox */}
              <div className="pt-2 border-t border-[#EADFC8]">
                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-[#5A4630]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 text-[#C9A24B] rounded"
                  />
                  <span>
                    I confirm acceptance of the{' '}
                    <Link to="/terms" className="underline font-semibold" target="_blank">Terms of Sale</Link>,{' '}
                    <Link to="/returns" className="underline font-semibold" target="_blank">Bullion Return Terms</Link>, and{' '}
                    <Link to="/shipping" className="underline font-semibold" target="_blank">Transit Custody Guarantee</Link>.
                  </span>
                </label>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isCheckoutDisabled}
                onClick={handlePlaceOrder}
                leftIcon={<Lock className="w-4 h-4" />}
              >
                {priceLockExpired
                  ? 'Price Lock Expired — Refresh Price'
                  : hasKycHold
                  ? 'Enter Valid PAN to Proceed'
                  : !isPincodeServiceable
                  ? 'Unserviceable PIN Code'
                  : !agreeTerms
                  ? 'Accept Terms to Continue'
                  : `Pay & Lock Order (${formatINR(grandTotal)})`}
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
