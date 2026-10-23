import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { calculatePrice, formatINR } from '../lib/pricing';
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
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemoUrl = searchParams.get('demo') === '1';

  const {
    cart,
    products,
    rates,
    pricingConfig,
    createOrderFromCart,
  } = useAppStore();

  useSEO({
    title: 'Secure Checkout & Insured Transit',
    description: 'Complete your order with high-value insured transit and bank-grade payment encryption.',
    canonicalPath: '/checkout',
  });

  // Guest vs Registered customer toggle
  const [isRegistered, setIsRegistered] = useState(false);

  // Form Fields
  const [name, setName] = useState('Vikramaditya Singhania');
  const [email, setEmail] = useState('vikram.singhania@heritage.in');
  const [phone, setPhone] = useState('+91 98200 11223');
  const [street, setStreet] = useState('72 Altamount Road, Cumballa Hill');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400026');

  // Carrier selection
  const [courier, setCourier] = useState<'Sequel' | 'BVC'>('Sequel');

  // Payment method (cosmetic)
  const [paymentMethod, setPaymentMethod] = useState<'netbanking' | 'upi' | 'card' | 'wire'>('netbanking');

  // Demo Outcome Selector (default Success)
  const [demoPaymentResult, setDemoPaymentResult] = useState<'Success' | 'Failed' | 'Pending' | 'Timeout'>('Success');

  // Payment State Machine: 'idle' | 'processing' | 'failed' | 'pending' | 'timeout'
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'failed' | 'pending' | 'timeout'>('idle');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Pincode Serviceability Check: Pincodes starting with 9 are NOT serviceable
  const isPincodeServiceable = !pincode.trim().startsWith('9') && pincode.trim().length >= 6;
  const isPincodeBlocked = pincode.trim().startsWith('9');

  // Pre-fill registered details on toggle
  const handleToggleRegistered = (registered: boolean) => {
    setIsRegistered(registered);
    if (registered) {
      setName('Vikramaditya Singhania');
      setEmail('vikram.singhania@heritage.in');
      setPhone('+91 98200 11223');
      setStreet('72 Altamount Road, Cumballa Hill');
      setCity('Mumbai');
      setState('Maharashtra');
      setPincode('400026');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setStreet('');
      setCity('');
      setState('');
      setPincode('');
    }
  };

  // Cart totals calculation
  let subtotal = 0;
  let totalGst = 0;
  let grandTotal = 0;

  const orderItems = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return null;
    const calc = calculatePrice(product, rates, pricingConfig);
    subtotal += calc.subtotal * item.quantity;
    totalGst += calc.gstAmount * item.quantity;
    grandTotal += calc.total * item.quantity;
    return { product, item, calc };
  }).filter(Boolean);

  // Submit Order / Payment Simulation
  const handlePlaceOrder = () => {
    if (!isPincodeServiceable) return;

    setPaymentState('processing');

    setTimeout(() => {
      if (demoPaymentResult === 'Success') {
        const order = createOrderFromCart(
          {
            name: name || 'Guest Customer',
            email: email || 'customer@aurum.internal',
            phone: phone || '+91 99999 88888',
            address: {
              name: name || 'Customer',
              street,
              city,
              state,
              pincode,
              country: 'India',
            },
          },
          paymentMethod === 'netbanking'
            ? 'NetBanking (HDFC Priority)'
            : paymentMethod === 'upi'
            ? 'UPI (Instant Transfer)'
            : paymentMethod === 'card'
            ? 'Credit Card'
            : 'Wire Transfer / RTGS',
          'Success'
        );

        setPaymentState('idle');
        navigate(`/order/${order.id}`);
      } else if (demoPaymentResult === 'Failed') {
        setPaymentState('failed');
      } else if (demoPaymentResult === 'Pending') {
        const order = createOrderFromCart(
          {
            name: name || 'Customer',
            email: email || 'customer@aurum.internal',
            phone: phone || '+91 99999 88888',
            address: { name, street, city, state, pincode, country: 'India' },
          },
          'NetBanking (Pending Verification)',
          'Pending'
        );
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#7A6A55] flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-[#C9A24B]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <Link to="/cart" className="hover:text-[#C9A24B]">Cart</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#EADFC8]" />
        <span className="text-[#5A4630] font-medium">Checkout</span>
      </nav>

      {/* Header */}
      <div className="border-b border-[#EADFC8] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A4630] flex items-center gap-2.5">
            <Lock className="w-7 h-7 text-[#C9A24B]" />
            Secure Order Checkout
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A55] mt-1">
            Complete your delivery and insurance details. All transactions are encrypted with bank-grade security.
          </p>
        </div>

        {/* Demo Parameter Badge & Selector */}
        {isDemoUrl && (
          <div className="p-3 bg-[#F1E3BD] border border-[#C9A24B] rounded-xl text-xs space-y-1.5 shadow-xs">
            <div className="font-bold text-[#5A4630] flex items-center gap-1.5">
              <span>Demo Mode Active (?demo=1)</span>
              <Badge variant="gold" size="sm">Simulator</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#7A6A55]">Simulate Result:</span>
              <select
                value={demoPaymentResult}
                onChange={(e) => setDemoPaymentResult(e.target.value as any)}
                aria-label="Demo payment outcome selector"
                className="bg-white border border-[#EADFC8] text-xs font-semibold text-[#5A4630] rounded px-2 py-1"
              >
                <option value="Success">Success (Order Confirmed)</option>
                <option value="Failed">Failed (Bank Decline)</option>
                <option value="Pending">Pending (Verification)</option>
                <option value="Timeout">Timeout (Session Expiry)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Payment Outcome Overlays */}
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
              Authorizing transaction and verifying cryptographic price snapshot. Please do not refresh.
            </p>
          </Card>
        </div>
      )}

      {paymentState === 'failed' && (
        <Card variant="surface" className="p-8 border-[#E89E95] bg-[#FFFBFB] text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#F7D4CF] border border-[#E89E95] flex items-center justify-center mx-auto text-[#8C2E24]">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#8C2E24]">
            Payment Declined / Failed
          </h2>
          <p className="text-xs text-[#7A6A55] leading-relaxed max-w-md mx-auto">
            Your bank declined the transaction or authentication failed. Your reserved items remain safe in your cart. You may retry with another payment method or bank account.
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
            Your bank has acknowledged the payment request, and we are awaiting gateway webhook settlement confirmation. A preliminary order record has been initiated.
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
            The banking gateway response exceeded the allowable security window. If funds were debited from your account, they will automatically reconcile within 24 hours.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="primary" onClick={() => setPaymentState('idle')}>
              Retry Transaction
            </Button>
            <Link to="/support">
              <Button variant="secondary" leftIcon={<Headphones className="w-4 h-4" />}>
                Customer Support
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Main Form Area (when not showing outcome card) */}
      {paymentState === 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact, Address, Shipping, Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Type Toggle */}
            <Card variant="surface" className="p-5 border-[#EADFC8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADFC8]">
                <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider">
                  1. Customer Profile
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
                  <label className="block text-[#5A4630] font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Full Name"
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

            {/* Delivery Address & Pincode Serviceability Check */}
            <Card variant="surface" className="p-5 border-[#EADFC8] space-y-4">
              <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider block pb-2 border-b border-[#EADFC8]">
                2. Insured Delivery Address
              </span>

              <div className="space-y-3 text-xs">
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
                      placeholder="City"
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
                      placeholder="State"
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
                  <div className="p-3 bg-[#F7D4CF] border border-[#E89E95] rounded-md text-xs text-[#8C2E24] flex items-start gap-2 animate-in fade-in">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>Not Serviceable:</strong> Pincodes beginning with "9" are outside our high-value armoured courier transit route. Please enter a serviceable destination.
                    </div>
                  </div>
                ) : isPincodeServiceable ? (
                  <div className="p-2.5 bg-[#DCE8D5] border border-[#A4C997] rounded-md text-xs text-[#2D5A27] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Pincode <strong>{pincode}</strong> is serviceable for 100% insured armoured courier transit.</span>
                  </div>
                ) : null}
              </div>
            </Card>

            {/* Courier & Shipping Method */}
            <Card variant="surface" className="p-5 border-[#EADFC8] space-y-4">
              <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider block pb-2 border-b border-[#EADFC8]">
                3. High-Value Armoured Shipping Partner
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-3.5 rounded-lg border cursor-pointer flex flex-col justify-between space-y-2 transition-all ${
                    courier === 'Sequel'
                      ? 'bg-[#F8EFD9] border-[#C9A24B] shadow-xs'
                      : 'bg-white border-[#EADFC8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#5A4630]">Sequel Secure Logistics</span>
                    <input
                      type="radio"
                      name="courierOption"
                      checked={courier === 'Sequel'}
                      onChange={() => setCourier('Sequel')}
                      className="text-[#C9A24B]"
                    />
                  </div>
                  <p className="text-[11px] text-[#7A6A55]">
                    Armoured Air Express • OTP Signature Delivery • 100% Insurance Included
                  </p>
                </label>

                <label
                  className={`p-3.5 rounded-lg border cursor-pointer flex flex-col justify-between space-y-2 transition-all ${
                    courier === 'BVC'
                      ? 'bg-[#F8EFD9] border-[#C9A24B] shadow-xs'
                      : 'bg-white border-[#EADFC8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#5A4630]">BVC Armoured Vaulting</span>
                    <input
                      type="radio"
                      name="courierOption"
                      checked={courier === 'BVC'}
                      onChange={() => setCourier('BVC')}
                      className="text-[#C9A24B]"
                    />
                  </div>
                  <p className="text-[11px] text-[#7A6A55]">
                    Tamper-Evident High-Security Courier • Transit Custody Guaranteed
                  </p>
                </label>
              </div>
            </Card>

            {/* Payment Method Choice (Cosmetic) */}
            <Card variant="surface" className="p-5 border-[#EADFC8] space-y-4">
              <span className="text-xs font-bold text-[#5A4630] uppercase tracking-wider block pb-2 border-b border-[#EADFC8]">
                4. Select Payment Method
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
                🔒 <strong>Payment Security:</strong> No card or credential data is stored locally. Client note: COD is not applicable for bullion & jewellery.
              </div>
            </Card>
          </div>

          {/* Right Column: Order Review & Completion (5 cols) */}
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
                  <span>Insured Armoured Transit:</span>
                  <span className="tabular-nums font-semibold text-[#2D5A27]">Complimentary</span>
                </div>
                <div className="flex justify-between text-[#7A6A55]">
                  <span>GST (3%):</span>
                  <span className="tabular-nums font-medium text-[#5A4630]">{formatINR(totalGst)}</span>
                </div>
                <div className="pt-3 border-t border-[#EADFC8] flex items-baseline justify-between">
                  <span className="font-serif text-xl font-bold text-[#5A4630]">Grand Total</span>
                  <span className="font-serif text-3xl font-bold text-[#5A4630] tabular-nums">
                    {formatINR(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Policy Links */}
              <div className="text-[11px] text-[#7A6A55] leading-relaxed">
                By placing this order, you agree to the{' '}
                <Link to="/terms" className="underline text-[#5A4630]">Terms</Link>,{' '}
                <Link to="/returns" className="underline text-[#5A4630]">Returns & Buyback Policy</Link>, and{' '}
                <Link to="/shipping" className="underline text-[#5A4630]">Transit Insurance Terms</Link>.
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!isPincodeServiceable}
                onClick={handlePlaceOrder}
                leftIcon={<Lock className="w-4 h-4" />}
              >
                {!isPincodeServiceable
                  ? 'Enter Serviceable Pincode'
                  : `Complete Order & Pay (${formatINR(grandTotal)})`}
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
