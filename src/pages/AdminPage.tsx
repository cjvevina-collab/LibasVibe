import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Database,
  Eye,
  EyeOff,
  FolderPlus,
  ImagePlus,
  Layers,
  Lock,
  LogOut,
  Package,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { ADMIN_UID, BRAND_INFO } from '../lib/firebase';
import { uploadImageToImgBB } from '../lib/imgbb';
import { Category, Order, OrderStatus, Product, ProductSize } from '../types/store';
import { formatPKR, formatPKRDecimal } from '../components/Formatters';

type AdminTab = 'overview' | 'products' | 'categories' | 'orders' | 'settings';

const ALL_SIZES: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL'];
const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.uid == '${ADMIN_UID}';
    }
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /orders/{orderId} {
      allow get: if true;
      allow create: if true;
      allow list, update, delete: if isAdmin();
    }
  }
}`;

export const AdminPage: React.FC = () => {
  const { user, loading: authLoading, isAdmin, loginWithEmail, logout } = useAuth();
  const {
    categories,
    products,
    orders,
    isUsingSeedFallback,
    firestoreError,
    firestoreNeedsRules,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    duplicateProduct,
    deleteProduct,
    seedCatalogToFirestore,
    updateOrderStatus,
    deleteOrder,
  } = useStore();

  // Auth form state (no hardcoded credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // Admin workspace state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [toast, setToast] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [rulesCopied, setRulesCopied] = useState(false);

  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pTitle, setPTitle] = useState('');
  const [pSku, setPSku] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pComparePrice, setPComparePrice] = useState('');
  const [pFabric, setPFabric] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [pSizes, setPSizes] = useState<ProductSize[]>(['S', 'M', 'L']);
  const [pInStock, setPInStock] = useState(true);
  const [pFeatured, setPFeatured] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Category modal state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [cName, setCName] = useState('');
  const [cSlug, setCSlug] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cImageUrl, setCImageUrl] = useState('');
  const [uploadingCatImg, setUploadingCatImg] = useState(false);
  const [savingCat, setSavingCat] = useState(false);

  // Order detail modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setActionError(null);
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSigningIn(true);
    try {
      await loginWithEmail(email, password);
      setPassword('');
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Sign-in failed. Check email and password.'
      );
    } finally {
      setSigningIn(false);
    }
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setPTitle('');
    setPSku('');
    setPCategory(categories[0]?.name || 'Pret Silk');
    setPPrice('');
    setPComparePrice('');
    setPFabric('');
    setPDescription('');
    setPImageUrl('');
    setPSizes(['S', 'M', 'L', 'XL']);
    setPInStock(true);
    setPFeatured(true);
    setProductModalOpen(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPTitle(prod.title);
    setPSku(prod.sku || '');
    setPCategory(prod.category);
    setPPrice(String(prod.price));
    setPComparePrice(prod.compareAtPrice ? String(prod.compareAtPrice) : '');
    setPFabric(prod.fabric || '');
    setPDescription(prod.description);
    setPImageUrl(prod.imageUrl);
    setPSizes(prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L']);
    setPInStock(prod.inStock);
    setPFeatured(prod.featured);
    setProductModalOpen(true);
  };

  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setActionError(null);
    try {
      const res = await uploadImageToImgBB(file);
      setPImageUrl(res.displayUrl);
      notify('Image uploaded to ImgBB.');
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'ImgBB upload failed.'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!pImageUrl.trim()) {
      setActionError('Please upload an image or paste an image URL.');
      return;
    }
    setSavingProduct(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          title: pTitle,
          sku: pSku,
          category: pCategory,
          price: Number(pPrice),
          compareAtPrice: pComparePrice ? Number(pComparePrice) : undefined,
          fabric: pFabric,
          description: pDescription,
          imageUrl: pImageUrl,
          sizes: pSizes,
          inStock: pInStock,
          featured: pFeatured,
        });
        notify('Product updated.');
      } else {
        await addProduct({
          title: pTitle,
          sku: pSku,
          category: pCategory,
          price: Number(pPrice),
          compareAtPrice: pComparePrice ? Number(pComparePrice) : undefined,
          fabric: pFabric,
          description: pDescription,
          imageUrl: pImageUrl,
          sizes: pSizes,
          inStock: pInStock,
          featured: pFeatured,
        });
        notify('Product added to catalog.');
      }
      setProductModalOpen(false);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to save product.'
      );
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDuplicate = async (prod: Product) => {
    setActionError(null);
    try {
      await duplicateProduct(prod);
      notify(`Duplicated "${prod.title}".`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to duplicate product.'
      );
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    setActionError(null);
    try {
      await deleteProduct(prod.id);
      notify(`Deleted "${prod.title}".`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to delete product.'
      );
    }
  };

  const openAddCategory = () => {
    setEditingCat(null);
    setCName('');
    setCSlug('');
    setCDescription('');
    setCImageUrl('');
    setCatModalOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCat(cat);
    setCName(cat.name);
    setCSlug(cat.slug);
    setCDescription(cat.description || '');
    setCImageUrl(cat.imageUrl || '');
    setCatModalOpen(true);
  };

  const handleCatImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCatImg(true);
    try {
      const res = await uploadImageToImgBB(file);
      setCImageUrl(res.displayUrl);
      notify('Category cover uploaded to ImgBB.');
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'ImgBB upload failed.'
      );
    } finally {
      setUploadingCatImg(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setSavingCat(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, {
          name: cName,
          slug: cSlug || cName,
          description: cDescription,
          imageUrl: cImageUrl,
        });
        notify('Category updated.');
      } else {
        await addCategory({
          name: cName,
          slug: cSlug || cName,
          description: cDescription,
          imageUrl: cImageUrl,
          sortOrder: categories.length + 1,
        });
        notify('Category created.');
      }
      setCatModalOpen(false);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to save category.'
      );
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    setActionError(null);
    try {
      await deleteCategory(cat.id);
      notify(`Deleted category "${cat.name}".`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to delete category.'
      );
    }
  };

  const handleSeedCatalog = async () => {
    setSeeding(true);
    setActionError(null);
    try {
      await seedCatalogToFirestore();
      notify('Sample categories and products synced to Firestore.');
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Failed to sync catalog to Firestore. Check Firestore rules.'
      );
    } finally {
      setSeeding(false);
    }
  };

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0),
    [orders]
  );

  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'Pending').length,
    [orders]
  );

  const filteredAdminProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-[#68625C]">
        Verifying session...
      </div>
    );
  }

  // Protected Login Gate (Email & Password hidden/unfilled)
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <div className="rounded-2xl border border-[#E6DFD8] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3EFEA] text-[#B68167]">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-[#232220]">
                Admin Access
              </h1>
              <p className="text-xs text-[#68625C]">{BRAND_INFO.name}</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {authError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                {authError}
              </div>
            )}

            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-medium uppercase tracking-wider text-[#68625C]"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm text-[#232220] focus:border-[#B68167] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium uppercase tracking-wider text-[#68625C]"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] py-2.5 pl-3.5 pr-10 text-sm text-[#232220] focus:border-[#B68167] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68625C] hover:text-[#232220]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="w-full rounded-full bg-[#232220] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#B68167] disabled:opacity-50"
            >
              {signingIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Admin Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E6DFD8] pb-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
            Store Management
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[#232220] sm:text-4xl">
            LibasVibe Admin Console
          </h1>
          <p className="mt-1 text-xs text-[#68625C]">
            Signed in as {user?.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isUsingSeedFallback && (
            <button
              type="button"
              onClick={handleSeedCatalog}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-full border border-[#B68167] bg-white px-4 py-2 text-xs font-medium text-[#97634A] hover:bg-[#F3EFEA]"
            >
              <Database className="h-3.5 w-3.5" />
              <span>{seeding ? 'Syncing...' : 'Sync Demo Catalog to Firebase'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-[#E6DFD8] bg-white px-4 py-2 text-xs font-medium text-[#232220] hover:border-red-300 hover:text-red-700"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {toast && (
        <div className="mt-5 rounded-xl border border-[#B68167]/40 bg-[#F3EFEA] px-4 py-3 text-sm font-medium text-[#232220]">
          {toast}
        </div>
      )}
      {firestoreNeedsRules && (
        <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-[#B68167]/50 bg-[#F3EFEA] px-4 py-3.5 text-xs text-[#232220] sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-[#97634A]">
              Firestore Rules Setup Pending on azee-12ad7
            </p>
            <p className="mt-0.5 text-[#68625C]">
              Changes are currently saved in local browser storage. Publish the Firestore Rules in your Firebase Console so products, categories, and orders sync live across all visitors.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="shrink-0 rounded-full bg-[#232220] px-4 py-2 text-xs font-medium text-white hover:bg-[#B68167]"
          >
            View &amp; Copy Rules
          </button>
        </div>
      )}
      {(actionError || firestoreError) && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          <p className="font-semibold">Firestore Notice:</p>
          <p className="mt-1 break-all">{actionError || firestoreError}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mt-6 flex flex-wrap gap-1.5 rounded-xl border border-[#E6DFD8] bg-[#F3EFEA] p-1.5">
        {(
          [
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'categories', label: `Categories (${categories.length})`, icon: FolderPlus },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
            { id: 'settings', label: 'Firebase Rules', icon: Database },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white text-[#232220] shadow-sm'
                  : 'text-[#68625C] hover:text-[#232220]'
              }`}
            >
              <Icon className="h-3.5 w-3.5 text-[#B68167]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#E6DFD8] bg-white p-6">
              <p className="text-xs uppercase tracking-wider text-[#68625C]">
                Total Revenue
              </p>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-[#232220]">
                {formatPKR(totalRevenue)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E6DFD8] bg-white p-6">
              <p className="text-xs uppercase tracking-wider text-[#68625C]">
                Orders ({pendingOrdersCount} Pending)
              </p>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-[#232220]">
                {orders.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E6DFD8] bg-white p-6">
              <p className="text-xs uppercase tracking-wider text-[#68625C]">
                Products
              </p>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-[#232220]">
                {products.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E6DFD8] bg-white p-6">
              <p className="text-xs uppercase tracking-wider text-[#68625C]">
                Categories
              </p>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-[#232220]">
                {categories.length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E6DFD8] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#E6DFD8] pb-4">
              <h2 className="font-display text-2xl font-semibold text-[#232220]">
                Recent Orders
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="text-xs font-medium text-[#97634A] hover:underline"
              >
                Manage All Orders
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#68625C]">
                No orders placed yet. Orders from Checkout will appear here in real time.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-[#E6DFD8]">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-3.5 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-[#232220]">
                        #{order.orderCode} · {order.customerName}
                      </p>
                      <p className="text-xs text-[#68625C]">
                        {order.phone} · {order.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-[#97634A]">
                        {order.status}
                      </span>
                      <span className="font-semibold tabular-nums text-[#232220]">
                        {formatPKRDecimal(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Products (Add, Edit, Duplicate, Delete + ImgBB Upload) */}
      {activeTab === 'products' && (
        <div className="mt-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <input
              type="search"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Filter products by title, category, SKU..."
              className="w-full sm:w-80 rounded-full border border-[#E6DFD8] bg-white px-4 py-2 text-sm text-[#232220] focus:border-[#B68167] focus:outline-none"
            />
            <button
              type="button"
              onClick={openAddProduct}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#232220] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#B68167]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>

          {/* Mobile Product Cards */}
          <div className="mt-6 space-y-3 md:hidden">
            {filteredAdminProducts.map((prod) => (
              <div
                key={prod.id}
                className="rounded-2xl border border-[#E6DFD8] bg-white p-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={prod.imageUrl}
                    alt={prod.title}
                    referrerPolicy="no-referrer"
                    className="h-16 w-12 rounded-md object-cover border border-[#E6DFD8] bg-[#F3EFEA] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#232220] truncate">
                      {prod.title}
                    </p>
                    <p className="text-xs text-[#68625C]">
                      {prod.category} · {formatPKR(prod.price)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#97634A]">
                      {prod.inStock ? 'In Stock' : 'Sold Out'}
                    </p>
                  </div>
                </div>
                <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-[#E6DFD8] pt-3">
                  <button
                    type="button"
                    onClick={() => openEditProduct(prod)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#E6DFD8] py-2 text-xs font-medium text-[#232220]"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(prod)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#E6DFD8] py-2 text-xs font-medium text-[#232220]"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(prod)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#E6DFD8] py-2 text-xs font-medium text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Product Table */}
          <div className="mt-6 hidden md:block overflow-x-auto rounded-2xl border border-[#E6DFD8] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E6DFD8] bg-[#FAF9F7] text-xs uppercase tracking-wider text-[#68625C]">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFD8]">
                {filteredAdminProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FAF9F7]/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={prod.imageUrl}
                          alt={prod.title}
                          referrerPolicy="no-referrer"
                          className="h-14 w-11 rounded-md object-cover border border-[#E6DFD8] bg-[#F3EFEA] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-[#232220] truncate max-w-[220px]">
                            {prod.title}
                          </p>
                          <p className="text-xs text-[#68625C]">
                            {prod.sku || prod.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#68625C] whitespace-nowrap">
                      {prod.category}
                    </td>
                    <td className="px-5 py-4 font-semibold tabular-nums text-[#232220] whitespace-nowrap">
                      {formatPKR(prod.price)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs">
                      <span
                        className={
                          prod.inStock ? 'text-[#232220]' : 'text-red-700'
                        }
                      >
                        {prod.inStock ? 'In Stock' : 'Sold Out'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditProduct(prod)}
                          title="Edit product"
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E6DFD8] px-2.5 py-1.5 text-xs font-medium text-[#232220] hover:border-[#B68167]"
                        >
                          <Pencil className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(prod)}
                          title="Duplicate product"
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E6DFD8] px-2.5 py-1.5 text-xs font-medium text-[#232220] hover:border-[#B68167]"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Duplicate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod)}
                          title="Delete product"
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E6DFD8] px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Categories */}
      {activeTab === 'categories' && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-[#232220]">
              Storefront Categories
            </h2>
            <button
              type="button"
              onClick={openAddCategory}
              className="inline-flex items-center gap-2 rounded-full bg-[#232220] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#B68167]"
            >
              <Plus className="h-4 w-4" />
              <span>Create Category</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex flex-col justify-between rounded-2xl border border-[#E6DFD8] bg-white p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-[#232220]">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#97634A]">/{cat.slug}</p>
                    </div>
                    {cat.imageUrl && (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className="h-12 w-12 rounded-lg object-cover border border-[#E6DFD8]"
                      />
                    )}
                  </div>
                  {cat.description && (
                    <p className="mt-3 text-xs leading-relaxed text-[#68625C]">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-[#E6DFD8] pt-4">
                  <button
                    type="button"
                    onClick={() => openEditCategory(cat)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E6DFD8] py-2 text-xs font-medium text-[#232220] hover:border-[#B68167]"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E6DFD8] py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Orders */}
      {activeTab === 'orders' && (
        <div className="mt-8">
          <div className="overflow-x-auto rounded-2xl border border-[#E6DFD8] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E6DFD8] bg-[#FAF9F7] text-xs uppercase tracking-wider text-[#68625C]">
                <tr>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">City</th>
                  <th className="px-5 py-3.5">Total (incl. Rs.199)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFD8]">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-[#68625C]"
                    >
                      No orders saved yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF9F7]/60">
                      <td className="px-5 py-4 font-semibold text-[#232220] whitespace-nowrap">
                        #{order.orderCode}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#232220]">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-[#68625C]">{order.phone}</p>
                      </td>
                      <td className="px-5 py-4 text-[#68625C] whitespace-nowrap">
                        {order.city}
                      </td>
                      <td className="px-5 py-4 font-semibold tabular-nums text-[#232220] whitespace-nowrap">
                        {formatPKRDecimal(order.total)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={async (e) => {
                            try {
                              await updateOrderStatus(
                                order.id,
                                e.target.value as OrderStatus
                              );
                              notify(`Order #${order.orderCode} marked ${e.target.value}.`);
                            } catch (err) {
                              setActionError(
                                err instanceof Error
                                  ? err.message
                                  : 'Unable to update order status.'
                              );
                            }
                          }}
                          className="rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-2.5 py-1.5 text-xs font-medium text-[#232220] focus:border-[#B68167] focus:outline-none"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-lg border border-[#E6DFD8] px-3 py-1.5 text-xs font-medium text-[#232220] hover:border-[#B68167]"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await deleteOrder(order.id);
                                notify(`Deleted order #${order.orderCode}.`);
                              } catch (err) {
                                setActionError(
                                  err instanceof Error
                                    ? err.message
                                    : 'Unable to delete order.'
                                );
                              }
                            }}
                            className="rounded-lg border border-[#E6DFD8] px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Firebase Rules & Configuration Reference */}
      {activeTab === 'settings' && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-[#E6DFD8] bg-white p-6">
            <h2 className="font-display text-2xl font-semibold text-[#232220]">
              Firestore Security Rules (Project: azee-12ad7)
            </h2>
            <p className="mt-2 text-sm text-[#68625C]">
              Your Admin Panel is locked strictly to Firebase Auth UID{' '}
              <code className="rounded bg-[#F3EFEA] px-1.5 py-0.5 text-xs text-[#232220]">
                {ADMIN_UID}
              </code>
              . Paste these rules into your Firebase Console → Firestore Database → Rules tab so public shoppers can browse &amp; place orders while only your account can edit products, categories, and order statuses.
            </p>

            <div className="mt-4 relative">
              <pre className="overflow-x-auto rounded-xl bg-[#232220] p-4 text-xs text-[#FAF9F7]">
                {FIRESTORE_RULES_SNIPPET}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(FIRESTORE_RULES_SNIPPET);
                  setRulesCopied(true);
                  setTimeout(() => setRulesCopied(false), 2000);
                }}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#232220] px-5 py-2 text-xs font-medium text-white hover:bg-[#B68167]"
              >
                {rulesCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied Rules</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Rules</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {productModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#232220]/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E6DFD8] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#E6DFD8] pb-4">
              <h2 className="font-display text-2xl font-semibold text-[#232220]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="rounded-full border border-[#E6DFD8] p-2 text-[#68625C] hover:text-[#232220]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    placeholder="e.g. Noor Ivory Raw Silk 3-Piece"
                    className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                    Category *
                  </label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="8950"
                    className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                    Compare Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pComparePrice}
                    onChange={(e) => setPComparePrice(e.target.value)}
                    placeholder="Optional"
                    className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={pSku}
                    onChange={(e) => setPSku(e.target.value)}
                    placeholder="LV-PS-105"
                    className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                  Fabric / Material
                </label>
                <input
                  type="text"
                  value={pFabric}
                  onChange={(e) => setPFabric(e.target.value)}
                  placeholder="Pure Raw Silk & Organza"
                  className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                  Product Image (Upload via ImgBB or Paste URL) *
                </label>
                <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#B68167] bg-[#FAF9F7] px-4 py-2.5 text-xs font-medium text-[#97634A] hover:bg-[#F3EFEA] shrink-0">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    required
                    value={pImageUrl}
                    onChange={(e) => setPImageUrl(e.target.value)}
                    placeholder="https://i.ibb.co/..."
                    className="flex-1 rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
                  />
                </div>
                {pImageUrl && (
                  <img
                    src={pImageUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="mt-3 h-28 w-22 rounded-lg object-cover border border-[#E6DFD8]"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                  Available Sizes
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_SIZES.map((sz) => {
                    const active = pSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() =>
                          setPSizes((prev) =>
                            prev.includes(sz)
                              ? prev.filter((item) => item !== sz)
                              : [...prev, sz]
                          )
                        }
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                          active
                            ? 'border-[#232220] bg-[#232220] text-white'
                            : 'border-[#E6DFD8] bg-white text-[#68625C]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  placeholder="Describe embroidery, cut, and outfit pieces..."
                  className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-1 text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pInStock}
                    onChange={(e) => setPInStock(e.target.checked)}
                    className="accent-[#B68167]"
                  />
                  <span>In Stock</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pFeatured}
                    onChange={(e) => setPFeatured(e.target.checked)}
                    className="accent-[#B68167]"
                  />
                  <span>Featured on Homepage</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#E6DFD8] pt-5">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="rounded-full border border-[#E6DFD8] px-5 py-2.5 text-xs font-medium text-[#68625C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="rounded-full bg-[#232220] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#B68167] disabled:opacity-50"
                >
                  {savingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {catModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#232220]/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#E6DFD8] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#E6DFD8] pb-4">
              <h2 className="font-display text-2xl font-semibold text-[#232220]">
                {editingCat ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="rounded-full border border-[#E6DFD8] p-2 text-[#68625C]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="e.g. Bridal Formals"
                  className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={cSlug}
                  onChange={(e) => setCSlug(e.target.value)}
                  placeholder="bridal-formals"
                  className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                  Cover Image (ImgBB Upload or URL)
                </label>
                <div className="mt-1.5 flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#B68167] bg-[#FAF9F7] px-3.5 py-2 text-xs font-medium text-[#97634A]">
                    <ImagePlus className="h-3.5 w-3.5" />
                    <span>{uploadingCatImg ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCatImageUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={cImageUrl}
                    onChange={(e) => setCImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={cDescription}
                  onChange={(e) => setCDescription(e.target.value)}
                  placeholder="Short collection summary"
                  className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#E6DFD8] pt-5">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="rounded-full border border-[#E6DFD8] px-5 py-2.5 text-xs font-medium text-[#68625C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCat}
                  className="rounded-full bg-[#232220] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#B68167] disabled:opacity-50"
                >
                  {savingCat ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#232220]/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#E6DFD8] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#E6DFD8] pb-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#232220]">
                  Order #{selectedOrder.orderCode}
                </h2>
                <p className="text-xs text-[#68625C]">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-full border border-[#E6DFD8] p-2 text-[#68625C]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-xl bg-[#FAF9F7] p-4 border border-[#E6DFD8]">
                <p className="font-semibold text-[#232220]">
                  {selectedOrder.customerName}
                </p>
                <p className="text-xs text-[#68625C] mt-0.5">
                  Phone: {selectedOrder.phone}
                  {selectedOrder.email ? ` · ${selectedOrder.email}` : ''}
                </p>
                <p className="mt-2 text-xs text-[#232220]">
                  {selectedOrder.address}, {selectedOrder.city}
                </p>
                {selectedOrder.notes && (
                  <p className="mt-2 text-xs text-[#97634A]">
                    Notes: {selectedOrder.notes}
                  </p>
                )}
              </div>

              <div className="divide-y divide-[#E6DFD8]">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2.5 text-xs sm:text-sm"
                  >
                    <span>
                      {item.title} ({item.size}) × {item.quantity}
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatPKR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E6DFD8] pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-[#68625C]">
                  <span>Standard Delivery</span>
                  <span className="tabular-nums">
                    {formatPKRDecimal(selectedOrder.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-[#232220]">
                  <span>Total ({selectedOrder.paymentMethod})</span>
                  <span className="tabular-nums">
                    {formatPKRDecimal(selectedOrder.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
