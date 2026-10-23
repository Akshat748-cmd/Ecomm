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
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  useSEO({
    title: 'Customer Account & Order History',
    description: 'Manage verified addresses, consent settings, order histories, and post-delivery return or buyback requests.',
    canonicalPath: '/account',
  });

  const {
    customers,
    orders,
    submitReturnRequest,
  } = useAppStore();

  const customer = customers[0] || {
    id: 'cust-01',
    name: 'Vikramaditya Singhania',
    email: 'vikram.singhania@heritage.in',
    phone: '+91 98200 11223',
    isVerified: true,
    totalOrders: 3,
    totalSpent: 485000,
    addresses: [
      {
        id: 'addr-01',
        type: 'Home',
        street: '72 Altamount Road, Cumballa Hill',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400026',
        isDefault: true,
      },
    ],
    consents: {
      marketing: true,
      smsAlerts: true,
      whatsappUpdates: true,
    },
    notes: [],
    fraudFlag: false,
    createdAt: '2026-01-15T10:30:00Z',
  };

  // State: Active tab
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'preferences' | 'returns'>('orders');

  // State: Address Book
  const [addresses, setAddresses] = useState(customer.addresses);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrType, setAddrType] = useState<'Home' | 'Office'>('Home');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');

  // State: Consent Toggles
  const [marketingConsent, setMarketingConsent] = useState(customer.consents.marketing);
  const [smsConsent, setSmsConsent] = useState(customer.consents.smsAlerts);
  const [whatsappConsent, setWhatsappConsent] = useState(customer.consents.whatsappUpdates);

  // State: Return Request Form
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [returnReason, setReturnReason] = useState('');
  const [returnSuccessMessage, setReturnSuccessMessage] = useState<string | null>(null);

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
    if (editingAddressId) {
      setAddresses(
        addresses.map((a) =>
          a.id === editingAddressId
            ? { ...a, type: addrType, street: addrStreet, city: addrCity, state: addrState, pincode: addrPincode }
            : a
        )
      );
    } else {
      const newAddr = {
        id: `addr-${Date.now()}`,
        type: addrType,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddr]);
    }
    setAddressModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
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
        <span className="text-[#5A4630] font-medium">Customer Account</span>
      </nav>

      {/* Account Overview Card */}
      <Card variant="surface" className="p-6 border-[#EADFC8] shadow-[0_4px_24px_rgba(90,70,48,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F8EFD9] border border-[#C9A24B] flex items-center justify-center text-[#5A4630] font-serif text-2xl font-bold shrink-0">
              {customer.name.charAt(0)}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-[#5A4630]">{customer.name}</h1>
                <Badge variant="sage" size="sm">Verified Investor</Badge>
              </div>
              <p className="text-xs text-[#7A6A55]">
                {customer.email} • {customer.phone}
              </p>
              <p className="text-[11px] text-[#7A6A55]/80">
                Customer since {new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EADFC8] gap-2">
            <div className="flex sm:flex-col items-start sm:items-end justify-between w-full">
              <span className="text-xs text-[#7A6A55]">Cumulative Portfolio</span>
              <div className="font-serif text-2xl font-bold text-[#5A4630] tabular-nums">
                {formatINR(orders.reduce((acc, o) => acc + (o.paymentStatus === 'Success' ? o.totalAmount : 0), 0))}
              </div>
              <span className="text-[11px] text-[#7A6A55]">{orders.length} Total Orders</span>
            </div>
            <Link
              to="/admin"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C9A24B] bg-[#FAF7F2] text-xs font-bold text-[#5A4630] hover:bg-[#C9A24B] hover:text-white transition-all shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>Admin Console →</span>
            </Link>
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
            <span>Order History ({orders.length})</span>
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
            <span>Address Book ({addresses.length})</span>
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
            <span>Communication & Consents</span>
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
            <span>Cancel & Returns Request</span>
          </button>
        </div>
      </Card>

      {/* TAB 1: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#5A4630]">
            Order History & Timelines
          </h2>

          <div className="space-y-4">
            {orders.map((order) => {
              const statusVariant =
                order.status === 'Delivered'
                  ? 'sage'
                  : order.status === 'Dispatched'
                  ? 'gold'
                  : order.status === 'Return requested'
                  ? 'amber'
                  : 'neutral';

              return (
                <Card key={order.id} variant="surface" className="p-5 border-[#EADFC8] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EADFC8]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#5A4630] text-sm">
                          {order.orderNumber}
                        </span>
                        <Badge variant={statusVariant} size="sm">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#7A6A55]">
                        Ordered on {formatFullDateTime(order.createdAt)} • {order.items.length} items
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
                      <span key={idx} className="p-2 rounded bg-[#FFFBF3] border border-[#EADFC8] text-[#5A4630]">
                        {it.name} (x{it.quantity})
                      </span>
                    ))}
                  </div>

                  {/* Return status notice if raised */}
                  {order.returnRequest && (
                    <div className="p-3 bg-[#FBE7B8] border border-[#E8C26E] rounded-md text-xs text-[#7A5310] flex items-center justify-between">
                      <span>
                        Return Status: <strong>{order.returnRequest.status}</strong> — Reason: "{order.returnRequest.reason}"
                      </span>
                      <span className="text-[11px]">Logged in Admin Queue</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ADDRESS BOOK */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#5A4630]">
              Saved Delivery Addresses
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
            {addresses.map((addr) => (
              <Card key={addr.id} variant="surface" className="p-5 border-[#EADFC8] space-y-3 relative">
                <div className="flex items-center justify-between">
                  <Badge variant={addr.type === 'Home' ? 'gold' : 'neutral'} size="sm">
                    {addr.type}
                  </Badge>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-[#2D5A27] bg-[#DCE8D5] px-2 py-0.5 rounded">
                      Default Delivery
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#5A4630] space-y-1">
                  <p className="font-semibold">{customer.name}</p>
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-[#7A6A55]">Phone: {customer.phone}</p>
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

      {/* TAB 3: COMMUNICATION & CONSENT PREFERENCES */}
      {activeTab === 'preferences' && (
        <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6">
          <div className="space-y-1 pb-4 border-b border-[#EADFC8]">
            <h2 className="font-serif text-xl font-bold text-[#5A4630]">
              Communication Consents & Alerts
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Configure which transaction notifications and market movements you consent to receive.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Marketing */}
            <div className="flex items-center justify-between p-4 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl">
              <div>
                <strong className="text-[#5A4630] block text-sm">Market Trend Briefings & Editorial</strong>
                <p className="text-[#7A6A55] text-xs">Receive weekly gold and silver spot market analyses and festive previews.</p>
              </div>
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="w-4 h-4 text-[#C9A24B] rounded"
              />
            </div>

            {/* SMS Alerts */}
            <div className="flex items-center justify-between p-4 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl">
              <div>
                <strong className="text-[#5A4630] block text-sm">Transactional SMS & OTP Verification</strong>
                <p className="text-[#7A6A55] text-xs">Mandatory dispatch notifications and courier OTP verification messages.</p>
              </div>
              <input
                type="checkbox"
                checked={smsConsent}
                onChange={(e) => setSmsConsent(e.target.checked)}
                className="w-4 h-4 text-[#C9A24B] rounded"
              />
            </div>

            {/* WhatsApp */}
            <div className="flex items-center justify-between p-4 bg-[#FFFBF3] border border-[#EADFC8] rounded-xl">
              <div>
                <strong className="text-[#5A4630] block text-sm">WhatsApp Real-Time Order Tracking</strong>
                <p className="text-[#7A6A55] text-xs">Receive live courier tracking links and assay verification PDF copies on WhatsApp.</p>
              </div>
              <input
                type="checkbox"
                checked={whatsappConsent}
                onChange={(e) => setWhatsappConsent(e.target.checked)}
                className="w-4 h-4 text-[#C9A24B] rounded"
              />
            </div>
          </div>

          <div className="pt-2 text-xs text-[#2D5A27] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences are automatically updated and persisted.</span>
          </div>
        </Card>
      )}

      {/* TAB 4: CANCEL / RETURN / REFUND REQUEST FORM */}
      {activeTab === 'returns' && (
        <Card variant="surface" className="p-6 border-[#EADFC8] space-y-6">
          <div className="space-y-1 pb-4 border-b border-[#EADFC8]">
            <h2 className="font-serif text-xl font-bold text-[#5A4630]">
              Cancel, Return or Buyback Request
            </h2>
            <p className="text-xs text-[#7A6A55]">
              Submit post-delivery return or cancellation requests directly to the administrative authorization queue.
            </p>
          </div>

          {returnSuccessMessage && (
            <div className="p-4 bg-[#DCE8D5] border border-[#A4C997] rounded-xl text-xs text-[#2D5A27] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{returnSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleReturnSubmit} className="space-y-5 text-xs">
            {/* Select Order */}
            <div>
              <label className="block text-[#5A4630] font-semibold mb-1">
                Select Order for Return / Cancellation
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#EADFC8] rounded-md text-[#5A4630] font-medium"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} ({o.status} • {formatINR(o.totalAmount)})
                  </option>
                ))}
              </select>
            </div>

            {/* Bullion Eligibility Advisory Note */}
            {containsBullion && (
              <div className="p-4 bg-[#FBE7B8] border border-[#E8C26E] rounded-xl text-xs text-[#7A5310] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-[#7A5310]" />
                  <span>Bullion Return & Buyback Advisory</span>
                </div>
                <p>
                  This order contains investment gold/silver bullion. <strong>Return and buyback terms are being finalised</strong> (client note: lifetime buyback: check policies). Standard 7-day return applies to jewellery and artefacts.
                </p>
              </div>
            )}

            {/* Reason Textarea */}
            <div>
              <label className="block text-[#5A4630] font-semibold mb-1">
                Reason for Return, Cancellation, or Replacement Request
              </label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                required
                rows={4}
                placeholder="Please describe the issue (e.g. bead size variance, assay verification question, transit box damage)..."
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
              Submit Request to Admin Authorization Queue
            </Button>
          </form>
        </Card>
      )}

      {/* Address Form Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title={editingAddressId ? 'Edit Address' : 'Add New Address'}
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
              <span>Home</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-[#5A4630]">
              <input
                type="radio"
                name="addrTypeRadio"
                checked={addrType === 'Office'}
                onChange={() => setAddrType('Office')}
                className="text-[#C9A24B]"
              />
              <span>Office</span>
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
                className="w-full px-3 py-2 bg-white border border-[#EADFC8] rounded-md text-[#5A4630]"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
