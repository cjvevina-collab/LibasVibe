import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  BRAND_INFO,
  OperationType,
  buildFirestoreError,
  db,
  isPermissionDeniedError,
  testFirestoreConnection,
} from '../lib/firebase';
import { BannerSlide, Category, Order, OrderStatus, Product } from '../types/store';
import { SEED_BANNERS, SEED_CATEGORIES, SEED_PRODUCTS } from '../data/seedCatalog';
import { useAuth } from './AuthContext';

const LOCAL_ORDERS_KEY = 'libasvibe_orders_cache_v1';
const LOCAL_PRODUCTS_KEY = 'libasvibe_products_cache_v1';
const LOCAL_CATEGORIES_KEY = 'libasvibe_categories_cache_v1';
const LOCAL_BANNERS_KEY = 'libasvibe_banners_cache_v1';

interface StoreContextValue {
  banners: BannerSlide[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  loadingCatalog: boolean;
  firestoreError: string | null;
  firestoreNeedsRules: boolean;
  isUsingSeedFallback: boolean;
  addBanner: (input: Omit<BannerSlide, 'id' | 'createdAt'>) => Promise<BannerSlide>;
  updateBanner: (id: string, input: Partial<BannerSlide>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  addCategory: (input: Omit<Category, 'id' | 'createdAt'>) => Promise<Category>;
  updateCategory: (id: string, input: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addProduct: (input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, input: Partial<Product>) => Promise<void>;
  duplicateProduct: (product: Product) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  seedCatalogToFirestore: () => Promise<void>;
  placeOrder: (
    orderInput: Omit<Order, 'id' | 'orderCode' | 'status' | 'createdAt' | 'deliveryFee' | 'total'>
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  lookupOrderByCode: (orderCode: string, phone: string) => Promise<Order | null>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `item-${Date.now()}`
  );
}

function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}-${Date.now()}-${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

function generateOrderCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  const suffix = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `LV-${num}${suffix}`;
}

function readLocalCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAdmin } = useAuth();
  const [banners, setBanners] = useState<BannerSlide[]>(() =>
    readLocalCache<BannerSlide[]>(LOCAL_BANNERS_KEY, SEED_BANNERS)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    readLocalCache<Category[]>(LOCAL_CATEGORIES_KEY, SEED_CATEGORIES)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    readLocalCache<Product[]>(LOCAL_PRODUCTS_KEY, SEED_PRODUCTS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    readLocalCache<Order[]>(LOCAL_ORDERS_KEY, [])
  );
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [firestoreNeedsRules, setFirestoreNeedsRules] = useState(false);
  const [isUsingSeedFallback, setIsUsingSeedFallback] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_BANNERS_KEY, JSON.stringify(banners));
    } catch {
      // Ignore storage quota errors
    }
  }, [banners]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
    } catch {
      // Ignore storage quota errors
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
    } catch {
      // Ignore storage quota errors
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage quota errors
    }
  }, [orders]);

  useEffect(() => {
    testFirestoreConnection();

    const unsubBanners = onSnapshot(
      query(collection(db, 'banners'), orderBy('sortOrder', 'asc')),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() } as BannerSlide)
          );
          setBanners(list);
        } else {
          setBanners((prev) => (prev.length > 0 ? prev : SEED_BANNERS));
        }
      },
      (err) => {
        if (isPermissionDeniedError(err)) {
          setFirestoreNeedsRules(true);
          buildFirestoreError(err, OperationType.LIST, 'banners', true);
        } else {
          buildFirestoreError(err, OperationType.LIST, 'banners');
        }
        setBanners((prev) => (prev.length > 0 ? prev : SEED_BANNERS));
      }
    );

    const unsubCategories = onSnapshot(
      query(collection(db, 'categories'), orderBy('sortOrder', 'asc')),
      (snapshot) => {
        setFirestoreNeedsRules(false);
        if (!snapshot.empty) {
          const list = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() } as Category)
          );
          setCategories(list);
          setIsUsingSeedFallback(false);
        } else {
          setCategories((prev) => (prev.length > 0 ? prev : SEED_CATEGORIES));
          setIsUsingSeedFallback(true);
        }
      },
      (err) => {
        if (isPermissionDeniedError(err)) {
          setFirestoreNeedsRules(true);
          buildFirestoreError(err, OperationType.LIST, 'categories', true);
        } else {
          buildFirestoreError(err, OperationType.LIST, 'categories');
        }
        setCategories((prev) => (prev.length > 0 ? prev : SEED_CATEGORIES));
        setIsUsingSeedFallback(true);
      }
    );

    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        setFirestoreNeedsRules(false);
        if (!snapshot.empty) {
          const list = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() } as Product)
          );
          list.sort((a, b) =>
            (b.createdAt || '').localeCompare(a.createdAt || '')
          );
          setProducts(list);
          setIsUsingSeedFallback(false);
        } else {
          setProducts((prev) => (prev.length > 0 ? prev : SEED_PRODUCTS));
          setIsUsingSeedFallback(true);
        }
        setLoadingCatalog(false);
      },
      (err) => {
        if (isPermissionDeniedError(err)) {
          setFirestoreNeedsRules(true);
          buildFirestoreError(err, OperationType.LIST, 'products', true);
        } else {
          const wrapped = buildFirestoreError(err, OperationType.LIST, 'products');
          setFirestoreError(wrapped.message);
        }
        setProducts((prev) => (prev.length > 0 ? prev : SEED_PRODUCTS));
        setIsUsingSeedFallback(true);
        setLoadingCatalog(false);
      }
    );

    return () => {
      unsubBanners();
      unsubCategories();
      unsubProducts();
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        setFirestoreNeedsRules(false);
        const list = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Order)
        );
        list.sort((a, b) =>
          (b.createdAt || '').localeCompare(a.createdAt || '')
        );
        setOrders(list);
        setFirestoreError(null);
      },
      (err) => {
        if (isPermissionDeniedError(err)) {
          setFirestoreNeedsRules(true);
          buildFirestoreError(err, OperationType.LIST, 'orders', true);
        } else {
          const wrapped = buildFirestoreError(err, OperationType.LIST, 'orders');
          setFirestoreError(wrapped.message);
        }
      }
    );
    return () => unsubOrders();
  }, [isAdmin]);

  const seedCatalogToFirestore = async () => {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    for (const banner of banners.length > 0 ? banners : SEED_BANNERS) {
      batch.set(doc(db, 'banners', banner.id), {
        kicker: banner.kicker || '',
        headline: banner.headline,
        subtitle: banner.subtitle || '',
        buttonLabel: banner.buttonLabel,
        buttonLink: banner.buttonLink,
        imageUrl: banner.imageUrl,
        mobileFocus: banner.mobileFocus || 'center',
        active: Boolean(banner.active),
        sortOrder: banner.sortOrder || 1,
        createdAt: banner.createdAt || now,
      });
    }

    for (const cat of categories.length > 0 ? categories : SEED_CATEGORIES) {
      batch.set(doc(db, 'categories', cat.id), {
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        imageUrl: cat.imageUrl || '',
        sortOrder: cat.sortOrder || 1,
        createdAt: cat.createdAt || now,
      });
    }

    for (const prod of products.length > 0 ? products : SEED_PRODUCTS) {
      batch.set(doc(db, 'products', prod.id), {
        title: prod.title,
        sku: prod.sku || '',
        category: prod.category,
        price: prod.price,
        ...(prod.compareAtPrice ? { compareAtPrice: prod.compareAtPrice } : {}),
        description: prod.description,
        fabric: prod.fabric || '',
        imageUrl: prod.imageUrl,
        images: prod.images && prod.images.length > 0 ? prod.images : [prod.imageUrl],
        sizes: prod.sizes,
        inStock: prod.inStock,
        featured: prod.featured,
        createdAt: prod.createdAt || now,
        updatedAt: now,
      });
    }

    try {
      await batch.commit();
      setFirestoreError(null);
      setFirestoreNeedsRules(false);
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        setFirestoreNeedsRules(true);
      }
      throw buildFirestoreError(err, OperationType.WRITE, 'products');
    }
  };

  const addBanner = async (
    input: Omit<BannerSlide, 'id' | 'createdAt'>
  ): Promise<BannerSlide> => {
    const id = generateId('banner');
    const now = new Date().toISOString();
    const payload: Omit<BannerSlide, 'id'> = {
      kicker: (input.kicker || '').trim(),
      headline: input.headline.trim(),
      subtitle: (input.subtitle || '').trim(),
      buttonLabel: input.buttonLabel.trim() || 'Shop Collection',
      buttonLink: input.buttonLink.trim() || '/shop',
      imageUrl: input.imageUrl.trim(),
      mobileFocus: input.mobileFocus || 'center',
      active: Boolean(input.active),
      sortOrder: input.sortOrder ?? banners.length + 1,
      createdAt: now,
    };
    const created: BannerSlide = { id, ...payload };

    try {
      await setDoc(doc(db, 'banners', id), payload);
      return created;
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        setFirestoreNeedsRules(true);
        setBanners((prev) => [...prev, created]);
        return created;
      }
      throw buildFirestoreError(err, OperationType.CREATE, `banners/${id}`);
    }
  };

  const updateBanner = async (id: string, input: Partial<BannerSlide>) => {
    const updates: Record<string, unknown> = {};
    if (input.kicker !== undefined) updates.kicker = input.kicker.trim();
    if (input.headline !== undefined) updates.headline = input.headline.trim();
    if (input.subtitle !== undefined) updates.subtitle = input.subtitle.trim();
    if (input.buttonLabel !== undefined)
      updates.buttonLabel = input.buttonLabel.trim();
    if (input.buttonLink !== undefined)
      updates.buttonLink = input.buttonLink.trim();
    if (input.imageUrl !== undefined) updates.imageUrl = input.imageUrl.trim();
    if (input.mobileFocus !== undefined) updates.mobileFocus = input.mobileFocus;
    if (input.active !== undefined) updates.active = Boolean(input.active);
    if (input.sortOrder !== undefined)
      updates.sortOrder = Number(input.sortOrder);

    try {
      await updateDoc(doc(db, 'banners', id), updates);
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        setFirestoreNeedsRules(true);
        setBanners((prev) =>
          prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
        );
        return;
      }
      throw buildFirestoreError(err, OperationType.UPDATE, `banners/${id}`);
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        setFirestoreNeedsRules(true);
        setBanners((prev) => prev.filter((b) => b.id !== id));
        return;
      }
      throw buildFirestoreError(err, OperationType.DELETE, `banners/${id}`);
    }
  };

  const addCategory = async (
    input: Omit<Category, 'id' | 'createdAt'>
  ): Promise<Category> => {
    const slug = slugify(input.slug || input.name);
    const id = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
    const now = new Date().toISOString();
    const payload: Omit<Category, 'id'> = {
      name: input.name.trim(),
      slug,
      description: (input.description || '').trim(),
      imageUrl: (input.imageUrl || '').trim(),
      sortOrder: input.sortOrder ?? categories.length + 1,
      createdAt: now,
    };
    const created: Category = { id, ...payload };

    try {
      await setDoc(doc(db, 'categories', id), payload);
      return created;
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        setFirestoreNeedsRules(true);
        setCategories((prev) => [...prev, created]);
        return created;
      }
      throw buildFirestoreError(err, OperationType.CREATE, `categories/${id}`);
    }
  };

  const updateCategory = async (id: string, input: Partial<Category>) => {
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.slug !== undefined) updates.slug = slugify(input.slug);
    if (input.description !== undefined)
      updates.description = input.description.trim();
    if (input.imageUrl !== undefined) updates.imageUrl = input.imageUrl.trim();
    if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder;

    try {
      await updateDoc(doc(db, 'categories', id), updates);
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        setFirestoreNeedsRules(true);
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
        );
        return;
      }
      throw buildFirestoreError(err, OperationType.UPDATE, `categories/${id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        setFirestoreNeedsRules(true);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        return;
      }
      throw buildFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  const addProduct = async (
    input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product> => {
    const id = generateId(slugify(input.title).slice(0, 24));
    const now = new Date().toISOString();
    const gallery =
      input.images && input.images.length > 0
        ? input.images.filter(Boolean)
        : [input.imageUrl.trim()];
    const primaryImage = gallery[0] || input.imageUrl.trim();

    const payload: Record<string, unknown> = {
      title: input.title.trim(),
      sku: (input.sku || `LV-${Math.floor(100 + Math.random() * 899)}`).trim(),
      category: input.category.trim(),
      price: Number(input.price),
      description: input.description.trim(),
      fabric: (input.fabric || '').trim(),
      imageUrl: primaryImage,
      images: gallery,
      sizes: input.sizes.length > 0 ? input.sizes : ['S', 'M', 'L'],
      inStock: Boolean(input.inStock),
      featured: Boolean(input.featured),
      createdAt: now,
      updatedAt: now,
    };
    if (input.compareAtPrice && Number(input.compareAtPrice) > 0) {
      payload.compareAtPrice = Number(input.compareAtPrice);
    }
    const created: Product = { id, ...(payload as Omit<Product, 'id'>) };

    try {
      await setDoc(doc(db, 'products', id), payload);
      return created;
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        setFirestoreNeedsRules(true);
        setProducts((prev) => [created, ...prev]);
        return created;
      }
      throw buildFirestoreError(err, OperationType.CREATE, `products/${id}`);
    }
  };

  const updateProduct = async (id: string, input: Partial<Product>) => {
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { updatedAt: now };
    if (input.title !== undefined) updates.title = input.title.trim();
    if (input.sku !== undefined) updates.sku = input.sku.trim();
    if (input.category !== undefined) updates.category = input.category.trim();
    if (input.price !== undefined) updates.price = Number(input.price);
    if (input.compareAtPrice !== undefined && input.compareAtPrice > 0) {
      updates.compareAtPrice = Number(input.compareAtPrice);
    }
    if (input.description !== undefined)
      updates.description = input.description.trim();
    if (input.fabric !== undefined) updates.fabric = input.fabric.trim();
    if (input.images !== undefined) {
      const cleaned = input.images.filter(Boolean);
      updates.images = cleaned;
      if (cleaned[0]) updates.imageUrl = cleaned[0];
    } else if (input.imageUrl !== undefined) {
      updates.imageUrl = input.imageUrl.trim();
    }
    if (input.sizes !== undefined) updates.sizes = input.sizes;
    if (input.inStock !== undefined) updates.inStock = Boolean(input.inStock);
    if (input.featured !== undefined) updates.featured = Boolean(input.featured);

    try {
      await updateDoc(doc(db, 'products', id), updates);
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        setFirestoreNeedsRules(true);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
        return;
      }
      throw buildFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  };

  const duplicateProduct = async (product: Product): Promise<Product> => {
    return addProduct({
      title: `${product.title} (Copy)`,
      sku: product.sku ? `${product.sku}-COPY` : undefined,
      category: product.category,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      description: product.description,
      fabric: product.fabric,
      imageUrl: product.imageUrl,
      images: product.images ? [...product.images] : [product.imageUrl],
      sizes: [...product.sizes],
      inStock: product.inStock,
      featured: false,
    });
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        setFirestoreNeedsRules(true);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        return;
      }
      throw buildFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const placeOrder = async (
    orderInput: Omit<
      Order,
      'id' | 'orderCode' | 'status' | 'createdAt' | 'deliveryFee' | 'total'
    >
  ): Promise<Order> => {
    const orderCode = generateOrderCode();
    const deliveryFee =
      orderInput.subtotal > BRAND_INFO.freeDeliveryThreshold
        ? 0
        : BRAND_INFO.standardDeliveryFee;
    const total = orderInput.subtotal + deliveryFee;
    const now = new Date().toISOString();

    const payload: Omit<Order, 'id'> = {
      orderCode,
      customerName: orderInput.customerName.trim(),
      phone: orderInput.phone.trim(),
      email: (orderInput.email || '').trim(),
      address: orderInput.address.trim(),
      city: orderInput.city.trim(),
      notes: (orderInput.notes || '').trim(),
      paymentMethod: orderInput.paymentMethod,
      ...(orderInput.paymentRef ? { paymentRef: orderInput.paymentRef.trim() } : {}),
      items: orderInput.items,
      subtotal: orderInput.subtotal,
      deliveryFee,
      total,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'orders', orderCode), payload);
      const saved: Order = { id: orderCode, ...payload };
      setOrders((prev) => [saved, ...prev.filter((o) => o.id !== orderCode)]);
      return saved;
    } catch (err) {
      buildFirestoreError(err, OperationType.CREATE, `orders/${orderCode}`, true);
      const fallbackOrder: Order = { id: orderCode, ...payload };
      setOrders((prev) => [fallbackOrder, ...prev]);
      return fallbackOrder;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: now });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: now } : o))
      );
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        setFirestoreNeedsRules(true);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status, updatedAt: now } : o
          )
        );
        return;
      }
      throw buildFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        setFirestoreNeedsRules(true);
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        return;
      }
      throw buildFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  const lookupOrderByCode = async (
    orderCode: string,
    phone: string
  ): Promise<Order | null> => {
    const cleanCode = orderCode.trim().toUpperCase();
    const cleanPhone = phone.replace(/\D/g, '').slice(-7);

    try {
      const snap = await getDoc(doc(db, 'orders', cleanCode));
      if (snap.exists()) {
        const order = { id: snap.id, ...snap.data() } as Order;
        const orderPhoneTail = (order.phone || '').replace(/\D/g, '').slice(-7);
        if (!cleanPhone || orderPhoneTail === cleanPhone) {
          return order;
        }
        return null;
      }
    } catch {
      // Fall back to local cache if needed
    }

    const localMatch = orders.find(
      (o) =>
        o.orderCode.toUpperCase() === cleanCode &&
        (!cleanPhone || o.phone.replace(/\D/g, '').slice(-7) === cleanPhone)
    );
    return localMatch || null;
  };

  return (
    <StoreContext.Provider
      value={{
        banners,
        categories,
        products,
        orders,
        loadingCatalog,
        firestoreError,
        firestoreNeedsRules,
        isUsingSeedFallback,
        addBanner,
        updateBanner,
        deleteBanner,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        duplicateProduct,
        deleteProduct,
        seedCatalogToFirestore,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        lookupOrderByCode,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return ctx;
}
