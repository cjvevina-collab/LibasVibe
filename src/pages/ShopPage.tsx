import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const ShopPage: React.FC = () => {
  const { products, categories, loadingCatalog } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>(
    'featured'
  );

  const categoryTabs = useMemo(
    () => ['All', ...categories.map((c) => c.name)],
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchesCat =
        selectedCategory === 'All' ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.fabric || '').toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="border-b border-[#E6DFD8] pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
          Catalog
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-[#232220] sm:text-5xl">
          Shop All Ensembles
        </h1>
      </div>

      {/* Filters Bar */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#F3EFEA] p-1.5 border border-[#E6DFD8]">
          {categoryTabs.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-white text-[#232220] shadow-sm'
                  : 'text-[#68625C] hover:text-[#232220]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68625C]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments..."
              className="w-full sm:w-56 rounded-full border border-[#E6DFD8] bg-white py-2 pl-10 pr-4 text-sm text-[#232220] placeholder:text-[#68625C]/70 focus:border-[#B68167] focus:outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')
            }
            aria-label="Sort products"
            className="rounded-full border border-[#E6DFD8] bg-white px-4 py-2 text-sm text-[#232220] focus:border-[#B68167] focus:outline-none"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loadingCatalog ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="animate-pulse">
              <div className="aspect-[3/4] rounded-xl bg-[#F3EFEA]" />
              <div className="mt-4 h-4 w-24 rounded bg-[#F3EFEA]" />
              <div className="mt-2 h-5 w-36 rounded bg-[#F3EFEA]" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-[#E6DFD8] bg-white p-12 text-center">
          <p className="font-display text-2xl font-medium text-[#232220]">
            No ensembles match your selection
          </p>
          <p className="mt-2 text-sm text-[#68625C]">
            Try clearing your search or switching to another category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-6 rounded-full bg-[#232220] px-6 py-2.5 text-xs font-medium text-white hover:bg-[#B68167]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-3.5 gap-y-8 sm:mt-10 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
