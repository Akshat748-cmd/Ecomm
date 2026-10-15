import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { useSEO } from '../lib/useSEO';
import { formatINR, calculatePrice } from '../lib/pricing';
import { BRAND_NAME } from '../lib/constants';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import type {
  Product,
  ProductCategory,
  ProductType,
  SupplierRecord,
  PurchaseRecord,
} from '../data/types';
import {
  PackagePlus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Edit,
  EyeOff,
  Eye,
  Award,
  Truck,
  Building2,
  FileText,
  Upload,
  Plus,
  Sparkles,
} from 'lucide-react';

export const AdminCataloguePage: React.FC = () => {
  useSEO({
    title: 'Catalogue & Assay Management',
    description: 'Manage precious bullion, natural gemstones, sacred Rudraksha, laboratory certificates, and supplier purchase records.',
    canonicalPath: '/admin/catalogue',
  });

  const {
    products,
    suppliers,
    purchaseRecords,
    rates,
    pricingConfig,
    adminUser,
    activeRole,
    addProduct,
    updateProduct,
    delistProduct,
    addSupplier,
    addPurchaseRecord,
  } = useAppStore();

  const currentActor = adminUser?.name || 'Vikram Sharma';
  const canManageCatalogue = activeRole === 'Super Admin' || activeRole === 'Catalogue';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'products' | 'suppliers'>('products');

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('gold');
  const [formType, setFormType] = useState<ProductType>('rateLinked');
  const [formBrand, setFormBrand] = useState(BRAND_NAME);
  const [formDescription, setFormDescription] = useState('');
  const [formNetWeightG, setFormNetWeightG] = useState<number>(10);
  const [formGrossWeightG, setFormGrossWeightG] = useState<number>(10);
  const [formPurity, setFormPurity] = useState<number>(0.9999);
  const [formMetal, setFormMetal] = useState<'Gold 24K' | 'Gold 22K' | 'Silver 999'>('Gold 24K');
  const [formStock, setFormStock] = useState<number>(20);
  const [formLotBatch, setFormLotBatch] = useState('LOT-AU24-2026-901');
  const [formMakingPercent, setFormMakingPercent] = useState<number>(0.04);
  const [formFixedPrice, setFormFixedPrice] = useState<number>(0);
  const [formMrp, setFormMrp] = useState<number>(150000);
  const [formPackagingCost, setFormPackagingCost] = useState<number>(250);
  const [formInsuranceCost, setFormInsuranceCost] = useState<number>(450);
  const [formStatus, setFormStatus] = useState<'Active' | 'Draft' | 'Delisted'>('Active');
  const [formVariant, setFormVariant] = useState('10g Investment Mint');
  const [formBarcode, setFormBarcode] = useState('8901234567890');
  const [formLaunchScheduledAt, setFormLaunchScheduledAt] = useState('');
  const [formIsDelisted, setFormIsDelisted] = useState(false);

  // Category-specific attribute fields
  // Bullion
  const [formBullionBatch, setFormBullionBatch] = useState('BATCH-AU-991');
  const [formBullionSerial, setFormBullionSerial] = useState('SN-AU-991-0021');
  const [formAssayBureau, setFormAssayBureau] = useState('National Refinery Assay Bureau');
  // Gemstone
  const [formGemVariety, setFormGemVariety] = useState('Burmese Ruby');
  const [formGemCarats, setFormGemCarats] = useState<number>(3.15);
  const [formGemCut, setFormGemCut] = useState('Cushion Mixed Cut');
  const [formGemColor, setFormGemColor] = useState('Pigeon Blood Red');
  const [formGemClarity, setFormGemClarity] = useState('Eye Clean');
  const [formGemTreatment, setFormGemTreatment] = useState('Unheated / Untreated Natural');
  const [formGemOrigin, setFormGemOrigin] = useState('Mogok, Burma');
  const [formGemDimensions, setFormGemDimensions] = useState('8.4 x 6.2 x 4.1 mm');
  // Rudraksha
  const [formRudMukhi, setFormRudMukhi] = useState('5 Mukhi');
  const [formRudProvenance, setFormRudProvenance] = useState('Nepal Himalayan Sacred Forest');
  const [formRudBeadCount, setFormRudBeadCount] = useState<number>(108);
  const [formRudSizeMm, setFormRudSizeMm] = useState<number>(18);
  const [formRudThread, setFormRudThread] = useState('Sacred Red Silk with Silver Wire');
  const [formRudCapping, setFormRudCapping] = useState('Pure Silver 925 Capped');

  // Certificate Fields
  const [formCertIssuer, setFormCertIssuer] = useState('BIS Hallmark & NABL Refinery Assay');
  const [formCertNumber, setFormCertNumber] = useState('B24-999-5481');
  const [formCertStatus, setFormCertStatus] = useState<'Verified' | 'Pending' | 'Not Found'>('Verified');
  const [formCertLot, setFormCertLot] = useState('LOT-AU24-2026-901');
  const [formCertFileUploaded, setFormCertFileUploaded] = useState(true);

  // Form Success / Error feedback
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Supplier & PO Modal States
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupCategory, setNewSupCategory] = useState<ProductCategory>('gold');
  const [newSupLicense, setNewSupLicense] = useState('HM/L-8821034');
  const [newSupGstin, setNewSupGstin] = useState('27AAACA9988D1Z4');
  const [newSupCity, setNewSupCity] = useState('Mumbai');
  const [newSupContact, setNewSupContact] = useState('Amit Shah (Logistics Lead)');

  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poInvoiceNo, setPoInvoiceNo] = useState('INV-PO-2026-9921');
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || 'sup-01');
  const [poLotNumber, setPoLotNumber] = useState('LOT-NEW-2026-001');
  const [poGrade, setPoGrade] = useState('Gold 24K (999.9)');
  const [poQuantity, setPoQuantity] = useState<number>(50);
  const [poUnitCost, setPoUnitCost] = useState<number>(128000);

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lotBatchSerial.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.certificate?.number || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      const pStatus = p.isDelisted ? 'Delisted' : p.status || 'Active';
      const matchesStatus = statusFilter === 'all' || pStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  // Handle open create product modal
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`PREC-SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCategory('gold');
    setFormType('rateLinked');
    setFormBrand(BRAND_NAME);
    setFormDescription('Artisanal bullion minted in accordance with BIS hallmarking standards.');
    setFormNetWeightG(10);
    setFormGrossWeightG(10);
    setFormPurity(0.9999);
    setFormMetal('Gold 24K');
    setFormStock(25);
    setFormLotBatch(`LOT-AU24-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormMakingPercent(0.04);
    setFormFixedPrice(0);
    setFormMrp(152000);
    setFormStatus('Active');
    setFormVariant('10g Investment Mint');
    setFormBarcode(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setFormLaunchScheduledAt('');
    setFormIsDelisted(false);
    setFormCertIssuer('BIS Hallmark & NABL Refinery Assay');
    setFormCertNumber(`B24-999-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCertStatus('Verified');
    setFormCertLot(`LOT-AU24-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormNotice(null);
    setFormError(null);
    setIsProductModalOpen(true);
  };

  // Handle open edit product modal
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormCategory(product.category);
    setFormType(product.type);
    setFormBrand(product.brand || BRAND_NAME);
    setFormDescription(product.description);
    setFormNetWeightG(product.netWeightG);
    setFormGrossWeightG(product.grossWeightG);
    setFormPurity(product.purity);
    setFormMetal(product.metal || 'Gold 24K');
    setFormStock(product.stock);
    setFormLotBatch(product.lotBatchSerial);
    setFormMakingPercent(product.makingPercent);
    setFormFixedPrice(product.fixedPrice || 0);
    setFormMrp(product.mrp);
    setFormPackagingCost(product.packagingCost || 250);
    setFormInsuranceCost(product.insuranceCost || 450);
    setFormStatus(product.status || (product.isDelisted ? 'Delisted' : 'Active'));
    setFormVariant(product.variant || 'Standard');
    setFormBarcode(product.barcode || '8901234567890');
    setFormLaunchScheduledAt(product.launchScheduledAt || '');
    setFormIsDelisted(product.isDelisted || false);

    // Cert
    setFormCertIssuer(product.certificate?.issuer || 'BIS Hallmark & NABL Refinery Assay');
    setFormCertNumber(product.certificate?.number || '');
    setFormCertStatus(product.certificate?.status || 'Verified');
    setFormCertLot(product.certificate?.linkedLot || product.lotBatchSerial);

    // Dynamic attributes
    if (product.attributes?.gemstone) {
      setFormGemVariety(product.attributes.gemstone.variety || 'Natural Gemstone');
      setFormGemCarats(product.attributes.gemstone.caratWeight || 3.0);
      setFormGemCut(product.attributes.gemstone.cut || 'Cushion Mixed Cut');
      setFormGemColor(product.attributes.gemstone.color || 'Vivid');
      setFormGemClarity(product.attributes.gemstone.clarity || 'Eye Clean');
      setFormGemTreatment(product.attributes.gemstone.treatment || 'Unheated');
      setFormGemOrigin(product.attributes.gemstone.origin || 'Ceylon');
      setFormGemDimensions(product.attributes.gemstone.dimensions || '8x6 mm');
    }
    if (product.attributes?.rudraksha) {
      setFormRudMukhi(String(product.attributes.rudraksha.mukhi || '5 Mukhi'));
      setFormRudProvenance(product.attributes.rudraksha.provenance || 'Nepal');
      setFormRudBeadCount(product.attributes.rudraksha.beadCount || 108);
      setFormRudSizeMm(product.attributes.rudraksha.sizeMm || 18);
      setFormRudThread(product.attributes.rudraksha.thread || 'Sacred Thread');
      setFormRudCapping(product.attributes.rudraksha.metalCapping || 'Pure Silver 925');
    }

    setFormNotice(null);
    setFormError(null);
    setIsProductModalOpen(true);
  };

  // Handle Save Product (Create or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) {
      setFormError('Please enter both Product Name and SKU.');
      return;
    }

    const slug = editingProduct?.slug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = editingProduct?.id || `prod-${formCategory}-${Date.now().toString().slice(-4)}`;

    const newProduct: Product = {
      id,
      slug,
      name: formName,
      category: formCategory,
      type: formCategory === 'gold' || formCategory === 'silver' ? 'rateLinked' : formType,
      sku: formSku,
      brand: formBrand,
      description: formDescription,
      netWeightG: Number(formNetWeightG),
      grossWeightG: Number(formGrossWeightG),
      purity: Number(formPurity),
      metal: formCategory === 'gold' ? formMetal : formCategory === 'silver' ? 'Silver 999' : undefined,
      stock: Number(formStock),
      reserved: editingProduct ? editingProduct.reserved : 0,
      damaged: editingProduct ? editingProduct.damaged || 0 : 0,
      quarantined: editingProduct ? editingProduct.quarantined || 0 : 0,
      reorderThreshold: editingProduct ? editingProduct.reorderThreshold || 5 : 5,
      lotBatchSerial: formLotBatch,
      certificate: {
        issuer: formCertIssuer,
        number: formCertNumber,
        status: formCertStatus,
        linkedLot: formCertLot,
        issueDate: editingProduct?.certificate?.issueDate || new Date().toISOString().split('T')[0],
        documentUrl: `https://aurum.internal/certs/${formCertNumber}.pdf`,
      },
      mrp: Number(formMrp),
      makingPercent: Number(formMakingPercent),
      fixedPrice: formCategory === 'gold' || formCategory === 'silver' ? undefined : Number(formFixedPrice),
      packagingCost: Number(formPackagingCost),
      insuranceCost: Number(formInsuranceCost),
      status: formIsDelisted ? 'Delisted' : formStatus,
      variant: formVariant,
      barcode: formBarcode,
      launchScheduledAt: formLaunchScheduledAt || undefined,
      isDelisted: formIsDelisted,
      attributes: {
        ...(formCategory === 'gold' || formCategory === 'silver'
          ? {
              bullion: {
                metal: formCategory === 'gold' ? 'Gold' : 'Silver',
                purity: `${formPurity * 1000} Fine`,
                fineWeightG: Number(formNetWeightG) * Number(formPurity),
                batch: formBullionBatch,
                serialNumber: formBullionSerial,
                assayManufacturer: formAssayBureau,
              },
            }
          : {}),
        ...(formCategory === 'gemstones' || formCategory === 'coloured-stones'
          ? {
              gemstone: {
                variety: formGemVariety,
                caratWeight: Number(formGemCarats),
                dimensions: formGemDimensions,
                cut: formGemCut,
                color: formGemColor,
                clarity: formGemClarity,
                treatment: formGemTreatment,
                origin: formGemOrigin,
                lotNumber: formLotBatch,
              },
            }
          : {}),
        ...(formCategory === 'rudraksha'
          ? {
              rudraksha: {
                mukhi: formRudMukhi,
                beadCount: Number(formRudBeadCount),
                sizeMm: Number(formRudSizeMm),
                thread: formRudThread,
                metalCapping: formRudCapping,
                supplierLot: formLotBatch,
                provenance: formRudProvenance,
              },
            }
          : {}),
      },
    };

    if (editingProduct) {
      updateProduct(newProduct, currentActor);
      setFormNotice(`Product "${newProduct.name}" updated successfully. Live across storefront immediately.`);
    } else {
      addProduct(newProduct, currentActor);
      setFormNotice(`New Product "${newProduct.name}" created successfully. Live in storefront immediately!`);
    }

    setTimeout(() => {
      setIsProductModalOpen(false);
      setFormNotice(null);
    }, 1200);
  };

  // Handle Delist toggle
  const handleToggleDelist = (product: Product) => {
    const nextDelisted = !product.isDelisted;
    delistProduct(product.id, nextDelisted, currentActor);
  };

  // Handle Save Supplier
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    const newSupplier: SupplierRecord = {
      id: `sup-${Date.now().toString().slice(-4)}`,
      name: newSupName,
      category: newSupCategory,
      hallmarkingLicenseNo: newSupLicense,
      gstin: newSupGstin,
      city: newSupCity,
      contactPerson: newSupContact,
      status: 'Active',
    };

    addSupplier(newSupplier, currentActor);
    setIsSupplierModalOpen(false);
    setNewSupName('');
  };

  // Handle Save Purchase Record (Inward PO)
  const handleSavePo = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === poSupplierId);
    const newRecord: PurchaseRecord = {
      id: `po-rec-${Date.now().toString().slice(-4)}`,
      purchaseInvoiceNo: poInvoiceNo,
      supplierId: poSupplierId,
      supplierName: sup?.name || 'Authorized Mint Partner',
      lotNumber: poLotNumber,
      receivedDate: new Date().toISOString().split('T')[0],
      metalPurityGrade: poGrade,
      quantityReceived: Number(poQuantity),
      unitCostBasis: Number(poUnitCost),
      totalCostBasis: Number(poQuantity) * Number(poUnitCost),
      status: 'Assayed & Accepted',
    };

    addPurchaseRecord(newRecord, currentActor);
    setIsPoModalOpen(false);
    setPoInvoiceNo(`INV-PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & METRICS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EADFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#5A4630]">
              Product Catalogue & Assay Records
            </h1>
            <Badge variant="gold" size="sm">Phase 8 Complete</Badge>
          </div>
          <p className="text-xs text-[#7A6A55] mt-1">
            Master SKU catalogue, dynamic category attributes, laboratory certificates, and institutional supplier records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            disabled={!canManageCatalogue}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Product
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPoModalOpen(true)}
            disabled={!canManageCatalogue}
            leftIcon={<Building2 className="w-4 h-4" />}
          >
            Record Inward PO
          </Button>
          <Link to="/c/gold" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Open Storefront
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. TAB CONTROLS */}
      <div className="flex items-center gap-2 border-b border-[#EADFC8]">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-[#C9A24B] text-[#5A4630] bg-[#F8EFD9]/40'
              : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
          }`}
        >
          <PackagePlus className="w-4 h-4 text-[#C9A24B]" />
          <span>Products & Merchandising</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white border border-[#EADFC8] text-[#5A4630]">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'suppliers'
              ? 'border-[#C9A24B] text-[#5A4630] bg-[#F8EFD9]/40'
              : 'border-transparent text-[#7A6A55] hover:text-[#5A4630]'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#C9A24B]" />
          <span>Suppliers & Purchase Records</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white border border-[#EADFC8] text-[#5A4630]">
            {suppliers.length + purchaseRecords.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PRODUCTS & MERCHANDISING                               */}
      {/* ============================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card className="p-4 bg-white border-[#EADFC8]">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A55]" />
                <input
                  type="text"
                  placeholder="Search by Title, SKU, Lot #, Cert #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FFFBF3] border border-[#EADFC8] rounded-lg focus:outline-none focus:border-[#C9A24B] text-[#5A4630]"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-[#7A6A55]">
                  <Filter className="w-3.5 h-3.5 text-[#C9A24B]" />
                  <span>Category:</span>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter products by category"
                  className="px-2.5 py-1.5 text-xs bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:border-[#C9A24B]"
                >
                  <option value="all">All Categories</option>
                  <option value="gold">Gold Bullion & Coins</option>
                  <option value="silver">Silver Bars & Idols</option>
                  <option value="gemstones">Precious Gemstones</option>
                  <option value="coloured-stones">Coloured Stones</option>
                  <option value="rudraksha">Sacred Rudraksha</option>
                  <option value="gifting">Luxury Gift Sets</option>
                </select>

                <div className="flex items-center gap-1 text-xs text-[#7A6A55] ml-2">
                  <span>Status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter products by status"
                  className="px-2.5 py-1.5 text-xs bg-[#FFFBF3] border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:border-[#C9A24B]"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Delisted">Delisted</option>
                </select>

                {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('all');
                      setStatusFilter('all');
                    }}
                    className="text-xs text-[#7A6A55]"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Products Table */}
          <Card className="overflow-hidden border-[#EADFC8] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                    <th className="py-3 px-4 font-semibold">Product Title & SKU</th>
                    <th className="py-3 px-3 font-semibold">Category & Model</th>
                    <th className="py-3 px-3 font-semibold">Specs / Purity</th>
                    <th className="py-3 px-3 font-semibold text-right">Live Price</th>
                    <th className="py-3 px-3 font-semibold text-center">Available Stock</th>
                    <th className="py-3 px-3 font-semibold">Assay / Cert</th>
                    <th className="py-3 px-3 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#7A6A55]">
                        <div className="max-w-xs mx-auto space-y-2">
                          <PackagePlus className="w-8 h-8 text-[#C9A24B] mx-auto opacity-50" />
                          <p className="font-semibold">No products match your criteria</p>
                          <p className="text-[11px] text-[#7A6A55]">
                            Try clearing the search query or category filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const priceCalc = calculatePrice(p, rates, pricingConfig);
                      const isDelisted = p.isDelisted || p.status === 'Delisted';
                      const available = Math.max(0, p.stock - p.reserved);

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-[#FFFBF3] transition-colors ${
                            isDelisted ? 'opacity-70 bg-gray-50/50' : ''
                          }`}
                        >
                          {/* Title & SKU */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#EADFC8] bg-[#FAF6EE] shrink-0 shadow-2xs">
                                <img
                                  src={p.imageUrl || `/products/${p.id}.jpg`}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium text-[#5A4630]">{p.name}</div>
                                <div className="text-[11px] text-[#7A6A55] font-mono mt-0.5">
                                  {p.sku} • Lot: {p.lotBatchSerial}
                                </div>
                                {p.variant && (
                                  <span className="inline-block px-1.5 py-0.2 rounded text-[10px] bg-[#F8EFD9] text-[#5A4630] mt-1">
                                    {p.variant}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category & Model */}
                          <td className="py-3 px-3">
                            <Badge variant="neutral" size="sm" className="capitalize">
                              {p.category}
                            </Badge>
                            <div className="text-[11px] text-[#7A6A55] mt-1">
                              {p.type === 'rateLinked' ? '⚡ Rate-Linked' : '🏷️ Fixed Catalog'}
                            </div>
                          </td>

                          {/* Specs */}
                          <td className="py-3 px-3 text-[11px] text-[#7A6A55]">
                            {p.category === 'gold' || p.category === 'silver' ? (
                              <div>
                                <div><strong>Net:</strong> {p.netWeightG}g</div>
                                <div><strong>Purity:</strong> {(p.purity * 1000).toFixed(0)} Fine</div>
                                <div><strong>Making:</strong> {(p.makingPercent * 100).toFixed(1)}%</div>
                              </div>
                            ) : p.category === 'gemstones' || p.category === 'coloured-stones' ? (
                              <div>
                                <div><strong>Carat:</strong> {p.attributes?.gemstone?.caratWeight || 0} ct</div>
                                <div><strong>Origin:</strong> {p.attributes?.gemstone?.origin || 'Certified'}</div>
                                <div><strong>Cut:</strong> {p.attributes?.gemstone?.cut || 'Faceted'}</div>
                              </div>
                            ) : p.category === 'rudraksha' ? (
                              <div>
                                <div><strong>Mukhi:</strong> {p.attributes?.rudraksha?.mukhi || '5 Mukhi'}</div>
                                <div><strong>Provenance:</strong> {p.attributes?.rudraksha?.provenance || 'Nepal'}</div>
                                <div><strong>Thread:</strong> {p.attributes?.rudraksha?.metalCapping || 'Silver'}</div>
                              </div>
                            ) : (
                              <div>Standard Gift Hamper</div>
                            )}
                          </td>

                          {/* Live Price */}
                          <td className="py-3 px-3 text-right">
                            <div className="font-semibold text-[#5A4630] tabular-nums font-mono">
                              {formatINR(priceCalc.total)}
                            </div>
                            <div className="text-[10px] text-[#7A6A55]">
                              {p.type === 'rateLinked' ? `incl. 3% GST` : `MRP: ${formatINR(p.mrp)}`}
                            </div>
                          </td>

                          {/* Stock */}
                          <td className="py-3 px-3 text-center">
                            <div
                              className={`font-bold tabular-nums ${
                                available === 0
                                  ? 'text-[#A83232]'
                                  : available <= 5
                                  ? 'text-[#C9A24B]'
                                  : 'text-[#2D5A27]'
                              }`}
                            >
                              {available} units
                            </div>
                            <div className="text-[10px] text-[#7A6A55]">
                              ({p.stock} on-hand, {p.reserved} res)
                            </div>
                          </td>

                          {/* Certificate */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1 font-mono text-[11px] text-[#5A4630]">
                              <Award className="w-3.5 h-3.5 text-[#C9A24B]" />
                              <span>{p.certificate?.number || 'In-House'}</span>
                            </div>
                            <div className="text-[10px] text-[#7A6A55] truncate max-w-[140px]">
                              {p.certificate?.issuer}
                            </div>
                            <Badge
                              variant={p.certificate?.status === 'Verified' ? 'sage' : 'neutral'}
                              size="sm"
                              className="mt-0.5 text-[9px] px-1 py-0"
                            >
                              {p.certificate?.status || 'Pending'}
                            </Badge>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 text-center">
                            {isDelisted ? (
                              <Badge variant="coral" size="sm">Delisted</Badge>
                            ) : p.status === 'Draft' ? (
                              <Badge variant="neutral" size="sm">Draft</Badge>
                            ) : (
                              <Badge variant="sage" size="sm">Active</Badge>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditModal(p)}
                                title="Edit specs, certificate, and pricing"
                                className="h-7 w-7 p-0"
                                disabled={!canManageCatalogue}
                              >
                                <Edit className="w-3.5 h-3.5 text-[#5A4630]" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleDelist(p)}
                                title={isDelisted ? 'Relist product on storefront' : 'Delist product from storefront'}
                                className="h-7 w-7 p-0"
                                disabled={!canManageCatalogue}
                              >
                                {isDelisted ? (
                                  <Eye className="w-3.5 h-3.5 text-[#2D5A27]" />
                                ) : (
                                  <EyeOff className="w-3.5 h-3.5 text-[#A83232]" />
                                )}
                              </Button>

                              <Link
                                to={`/p/${p.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center h-7 w-7 rounded hover:bg-[#F8EFD9] text-[#7A6A55]"
                                title="Inspect product on storefront"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="p-3 bg-[#F8EFD9]/40 border-t border-[#EADFC8] flex items-center justify-between text-xs text-[#7A6A55] flex-wrap gap-2">
              <div>
                Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-[#2D5A27]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Direct Storefront Reactivity Active
                </span>
                <span>•</span>
                <span>Audit Module: <strong>Catalogue</strong></span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SUPPLIERS & INWARD PURCHASE RECORDS                     */}
      {/* ============================================================== */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          {/* Supplier Directory */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#5A4630]">
                  Approved Precious Metal Refineries & Artisanal Trusts
                </h3>
                <p className="text-xs text-[#7A6A55]">
                  Statutory BIS hallmarking licenses, refinery credentials, and authorized gemstone importers.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSupplierModalOpen(true)}
                disabled={!canManageCatalogue}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Supplier Partner
              </Button>
            </div>

            <Card className="overflow-hidden border-[#EADFC8] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                    <th className="py-2.5 px-4 font-semibold">Supplier Name</th>
                    <th className="py-2.5 px-3 font-semibold">Specialization</th>
                    <th className="py-2.5 px-3 font-semibold">BIS / Hallmark License</th>
                    <th className="py-2.5 px-3 font-semibold">GSTIN & Location</th>
                    <th className="py-2.5 px-3 font-semibold">Point of Contact</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
                  {suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FFFBF3]">
                      <td className="py-3 px-4 font-semibold text-[#5A4630]">
                        {s.name}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="neutral" size="sm" className="capitalize">
                          {s.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#7A6A55]">
                        {s.hallmarkingLicenseNo}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] text-[#5A4630]">{s.gstin}</div>
                        <div className="text-[10px] text-[#7A6A55]">{s.city}</div>
                      </td>
                      <td className="py-3 px-3 text-[#7A6A55]">
                        {s.contactPerson}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="sage" size="sm">{s.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </Card>
          </div>

          {/* Inward Purchase Records Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#5A4630]">
                  Inward Consignment Purchase Records (PO Logs)
                </h3>
                <p className="text-xs text-[#7A6A55]">
                  Audit trail of raw bullion and gemstone consignments received, cost basis, and assay clearance.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsPoModalOpen(true)}
                disabled={!canManageCatalogue}
                leftIcon={<Truck className="w-3.5 h-3.5" />}
              >
                Record Inward Ingestion
              </Button>
            </div>

            <Card className="overflow-hidden border-[#EADFC8] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8EFD9] text-[#5A4630] border-b border-[#EADFC8]">
                    <th className="py-2.5 px-4 font-semibold">PO / Invoice #</th>
                    <th className="py-2.5 px-3 font-semibold">Supplier Name</th>
                    <th className="py-2.5 px-3 font-semibold">Lot / Ingestion Ref</th>
                    <th className="py-2.5 px-3 font-semibold">Grade / Purity</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Quantity</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Unit Cost Basis</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total Cost Basis</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Assay Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFC8]/60 text-[#5A4630]">
                  {purchaseRecords.map((po) => (
                    <tr key={po.id} className="hover:bg-[#FFFBF3]">
                      <td className="py-3 px-4 font-mono font-semibold text-[#5A4630]">
                        {po.purchaseInvoiceNo}
                        <div className="text-[10px] text-[#7A6A55] font-sans">{po.receivedDate}</div>
                      </td>
                      <td className="py-3 px-3 text-[#5A4630] font-medium">
                        {po.supplierName}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#7A6A55]">
                        {po.lotNumber}
                      </td>
                      <td className="py-3 px-3 text-[#5A4630]">
                        {po.metalPurityGrade}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums">
                        {po.quantityReceived}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#7A6A55]">
                        {formatINR(po.unitCostBasis)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-[#5A4630] tabular-nums">
                        {formatINR(po.totalCostBasis)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={po.status === 'Assayed & Accepted' ? 'sage' : 'neutral'}
                          size="sm"
                        >
                          {po.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. PRODUCT FORM MODAL (CREATE / EDIT)                           */}
      {/* ============================================================== */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? `Edit Catalogue SKU: ${editingProduct.sku}` : 'Add New Precious Item to Catalogue'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-5 text-xs text-[#5A4630]">
          {formNotice && (
            <div className="p-3 bg-[#EBF3E8] border border-[#2D5A27]/20 rounded-lg text-[#2D5A27] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{formNotice}</span>
            </div>
          )}

          {formError && (
            <div className="p-3 bg-[#FDF2F2] border border-[#A83232]/20 rounded-lg text-[#A83232] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section A: Core Product Identification */}
          <div className="space-y-3 pb-4 border-b border-[#EADFC8]">
            <h4 className="font-serif text-sm font-bold text-[#5A4630] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C9A24B]" />
              Core Product Specifications & Nomenclature
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. 24K (999.9) Pure Gold Investment Coin 20g"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:border-[#C9A24B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  SKU Reference *
                </label>
                <input
                  type="text"
                  required
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:border-[#C9A24B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:border-[#C9A24B]"
                >
                  <option value="gold">Gold Bullion & Coins</option>
                  <option value="silver">Silver Bars & Idols</option>
                  <option value="gemstones">Precious Natural Gemstones</option>
                  <option value="coloured-stones">Coloured Sapphires</option>
                  <option value="rudraksha">Sacred Consecrated Rudraksha</option>
                  <option value="gifting">Luxury Festive Gift Sets</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Pricing Model
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as ProductType)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:border-[#C9A24B]"
                >
                  <option value="rateLinked">⚡ Live Bullion Rate-Linked</option>
                  <option value="fixed">🏷️ Fixed Catalog Pricing</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Brand / Assayer
                </label>
                <input
                  type="text"
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:border-[#C9A24B]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Product Description & Customer Briefing
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg text-[#5A4630] focus:outline-none focus:border-[#C9A24B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Variant Descriptor
                </label>
                <input
                  type="text"
                  value={formVariant}
                  onChange={(e) => setFormVariant(e.target.value)}
                  placeholder="e.g. 10g Ingot Bar, Single Bead"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg text-[#5A4630]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Barcode / EAN-13
                </label>
                <input
                  type="text"
                  value={formBarcode}
                  onChange={(e) => setFormBarcode(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg text-[#5A4630]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Launch Scheduling (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formLaunchScheduledAt}
                  onChange={(e) => setFormLaunchScheduledAt(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg text-[#5A4630]"
                />
              </div>
            </div>
          </div>

          {/* Section B: Dynamic Fields Changing By Category */}
          <div className="space-y-3 pb-4 border-b border-[#EADFC8]">
            <h4 className="font-serif text-sm font-bold text-[#5A4630] flex items-center justify-between">
              <span>Category Specialized Parameters</span>
              <span className="text-[11px] text-[#C9A24B] uppercase font-semibold">
                Fields adapt for {formCategory}
              </span>
            </h4>

            {/* BULLION FIELDS (Gold or Silver) */}
            {(formCategory === 'gold' || formCategory === 'silver') && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#FFFBF3] p-3 rounded-xl border border-[#EADFC8]">
                {formCategory === 'gold' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                      Metal Standard
                    </label>
                    <select
                      value={formMetal}
                      onChange={(e) => setFormMetal(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                    >
                      <option value="Gold 24K">Gold 24K (999.9 Fine)</option>
                      <option value="Gold 22K">Gold 22K (916 Standard)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Net Weight (Grams) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formNetWeightG}
                    onChange={(e) => setFormNetWeightG(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Fine Metal Purity (e.g. 0.9999)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formPurity}
                    onChange={(e) => setFormPurity(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Making Charge %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formMakingPercent * 100}
                    onChange={(e) => setFormMakingPercent(Number(e.target.value) / 100)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Refinery Ingot Batch #
                  </label>
                  <input
                    type="text"
                    value={formBullionBatch}
                    onChange={(e) => setFormBullionBatch(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Laser Serial Number
                  </label>
                  <input
                    type="text"
                    value={formBullionSerial}
                    onChange={(e) => setFormBullionSerial(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Assay Manufacturing Partner
                  </label>
                  <input
                    type="text"
                    value={formAssayBureau}
                    onChange={(e) => setFormAssayBureau(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* GEMSTONE FIELDS */}
            {(formCategory === 'gemstones' || formCategory === 'coloured-stones') && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#FFFBF3] p-3 rounded-xl border border-[#EADFC8]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Gem Variety
                  </label>
                  <input
                    type="text"
                    value={formGemVariety}
                    onChange={(e) => setFormGemVariety(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Carat Weight (ct) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formGemCarats}
                    onChange={(e) => setFormGemCarats(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Geographic Provenance / Origin
                  </label>
                  <input
                    type="text"
                    value={formGemOrigin}
                    onChange={(e) => setFormGemOrigin(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Cut & Facet Style
                  </label>
                  <input
                    type="text"
                    value={formGemCut}
                    onChange={(e) => setFormGemCut(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Color Grade & Tone
                  </label>
                  <input
                    type="text"
                    value={formGemColor}
                    onChange={(e) => setFormGemColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Treatment State
                  </label>
                  <input
                    type="text"
                    value={formGemTreatment}
                    onChange={(e) => setFormGemTreatment(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Fixed Catalog Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formFixedPrice}
                    onChange={(e) => setFormFixedPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* RUDRAKSHA FIELDS */}
            {formCategory === 'rudraksha' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#FFFBF3] p-3 rounded-xl border border-[#EADFC8]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Mukhi Faces *
                  </label>
                  <input
                    type="text"
                    value={formRudMukhi}
                    onChange={(e) => setFormRudMukhi(e.target.value)}
                    placeholder="e.g. 5 Mukhi, 7 Mukhi"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Himalayan Provenance
                  </label>
                  <input
                    type="text"
                    value={formRudProvenance}
                    onChange={(e) => setFormRudProvenance(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Bead Diameter (mm)
                  </label>
                  <input
                    type="number"
                    value={formRudSizeMm}
                    onChange={(e) => setFormRudSizeMm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Metal Capping & Thread
                  </label>
                  <input
                    type="text"
                    value={formRudCapping}
                    onChange={(e) => setFormRudCapping(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Consecration Trust / Sadhana
                  </label>
                  <input
                    type="text"
                    value={formRudThread}
                    onChange={(e) => setFormRudThread(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Fixed Catalog Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formFixedPrice}
                    onChange={(e) => setFormFixedPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* GIFTING FIELDS */}
            {formCategory === 'gifting' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#FFFBF3] p-3 rounded-xl border border-[#EADFC8]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Catalog Base Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formFixedPrice}
                    onChange={(e) => setFormFixedPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                    Packaging & Insured Casket Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formPackagingCost}
                    onChange={(e) => setFormPackagingCost(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section C: Certificate & Assay Documentation */}
          <div className="space-y-3 pb-4 border-b border-[#EADFC8]">
            <h4 className="font-serif text-sm font-bold text-[#5A4630] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#C9A24B]" />
              Authenticity Certificate & Assay Credentials
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Certifying Authority *
                </label>
                <input
                  type="text"
                  value={formCertIssuer}
                  onChange={(e) => setFormCertIssuer(e.target.value)}
                  placeholder="e.g. BIS Hallmark, GIA, IGI"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Certificate Number *
                </label>
                <input
                  type="text"
                  value={formCertNumber}
                  onChange={(e) => setFormCertNumber(e.target.value)}
                  placeholder="e.g. B24-999-5481"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Verification Status
                </label>
                <select
                  value={formCertStatus}
                  onChange={(e) => setFormCertStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                >
                  <option value="Verified">✓ Verified Credentials</option>
                  <option value="Pending">⏳ Pending Assay Review</option>
                  <option value="Not Found">❌ Non-Conforming / Disputed</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Linked Refinery Lot
                </label>
                <input
                  type="text"
                  value={formCertLot}
                  onChange={(e) => setFormCertLot(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Laboratory Certificate File (PDF / Image Upload)
                </label>
                <div className="flex items-center gap-2 p-2 bg-[#FFFBF3] border border-dashed border-[#C9A24B] rounded-lg">
                  <Upload className="w-4 h-4 text-[#C9A24B] shrink-0" />
                  <span className="text-[11px] text-[#5A4630] truncate flex-1">
                    {formCertFileUploaded ? `${formCertNumber}.pdf (Digital NABL Assay Attached)` : 'No file chosen'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormCertFileUploaded(true)}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#EADFC8] rounded hover:bg-[#F8EFD9]"
                  >
                    Simulate Upload
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section D: Stock & Storefront Visibility */}
          <div className="space-y-3 pb-2">
            <h4 className="font-serif text-sm font-bold text-[#5A4630] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#C9A24B]" />
              Stock Pool & Storefront Visibility Controls
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Initial On-Hand Stock (Units)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formStock}
                  onChange={(e) => setFormStock(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Lot / Ingestion Reference
                </label>
                <input
                  type="text"
                  value={formLotBatch}
                  onChange={(e) => setFormLotBatch(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                  Product Publication Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
                >
                  <option value="Active">Active (Visible on Storefront)</option>
                  <option value="Draft">Draft (Internal Only)</option>
                  <option value="Delisted">Delisted (Hidden from Customers)</option>
                </select>
              </div>

              <div className="md:col-span-3 flex items-center gap-2 p-2.5 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg">
                <input
                  type="checkbox"
                  id="delistToggle"
                  checked={formIsDelisted}
                  onChange={(e) => setFormIsDelisted(e.target.checked)}
                  className="rounded text-[#C9A24B] focus:ring-[#C9A24B] border-[#EADFC8]"
                />
                <label htmlFor="delistToggle" className="text-xs text-[#5A4630] font-medium cursor-pointer">
                  <strong>Delist from Storefront:</strong> Instantly hides product from storefront category listings, search results, and checkout drawers while preserving historical order references.
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EADFC8]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsProductModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {editingProduct ? 'Save & Update Storefront Live' : 'Publish Product to Storefront'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* 4. MODAL: ADD SUPPLIER                                         */}
      {/* ============================================================== */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title="Register Authorized Supplier / Refinery Partner"
        maxWidth="md"
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs text-[#5A4630]">
          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Supplier Organization Name *
            </label>
            <input
              type="text"
              required
              value={newSupName}
              onChange={(e) => setNewSupName(e.target.value)}
              placeholder="e.g. MMTC-PAMP India Pvt Ltd"
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                Category
              </label>
              <select
                value={newSupCategory}
                onChange={(e) => setNewSupCategory(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
              >
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="gemstones">Gemstones</option>
                <option value="rudraksha">Rudraksha</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={newSupCity}
                onChange={(e) => setNewSupCity(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              BIS Hallmarking License #
            </label>
            <input
              type="text"
              value={newSupLicense}
              onChange={(e) => setNewSupLicense(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              GSTIN
            </label>
            <input
              type="text"
              value={newSupGstin}
              onChange={(e) => setNewSupGstin(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
              Principal Contact Person
            </label>
            <input
              type="text"
              value={newSupContact}
              onChange={(e) => setNewSupContact(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EADFC8]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsSupplierModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Register Supplier
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* 5. MODAL: RECORD INWARD PO                                     */}
      {/* ============================================================== */}
      <Modal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        title="Record Inward Consignment / Purchase PO"
        maxWidth="md"
      >
        <form onSubmit={handleSavePo} className="space-y-4 text-xs text-[#5A4630]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                PO / Invoice # *
              </label>
              <input
                type="text"
                required
                value={poInvoiceNo}
                onChange={(e) => setPoInvoiceNo(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                Refinery Supplier *
              </label>
              <select
                value={poSupplierId}
                onChange={(e) => setPoSupplierId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                Lot / Ingestion #
              </label>
              <input
                type="text"
                value={poLotNumber}
                onChange={(e) => setPoLotNumber(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                Metal Purity / Grade
              </label>
              <input
                type="text"
                value={poGrade}
                onChange={(e) => setPoGrade(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#EADFC8] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                Quantity Received (Units)
              </label>
              <input
                type="number"
                min="1"
                value={poQuantity}
                onChange={(e) => setPoQuantity(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#7A6A55] mb-1">
                Unit Cost Basis (₹)
              </label>
              <input
                type="number"
                value={poUnitCost}
                onChange={(e) => setPoUnitCost(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#EADFC8] rounded-lg"
              />
            </div>
          </div>

          <div className="p-3 bg-[#FFFBF3] border border-[#EADFC8] rounded-lg flex items-center justify-between">
            <span className="text-xs text-[#7A6A55]">Total Consignment Cost Basis:</span>
            <span className="font-mono font-bold text-sm text-[#5A4630]">
              {formatINR(Number(poQuantity) * Number(poUnitCost))}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EADFC8]">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPoModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Inward Consignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
