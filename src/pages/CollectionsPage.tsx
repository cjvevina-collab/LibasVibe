import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const CollectionsPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { categories, products } = useStore();

  const activeCategory = slug
    ? categories.find((c) => c.slug === slug)
    : undefined;

  if (slug && activeCategory) {
    const catProducts = products.filter(
      (p) => p.category.toLowerCase() === activeCategory.name.toLowerCase()
    );

    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#68625C] hover:text-[#232220]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Collections</span>
        </Link>

        <div className="mt-6 border-b border-[#E6DFD8] pb-8">
          <h1 className="font-display text-4xl font-semibold text-[#232220] sm:text-5xl">
            {activeCategory.name}
          </h1>
          {activeCategory.description && (
            <p className="mt-3 max-w-xl text-sm text-[#68625C]">
              {activeCategory.description}
            </p>
          )}
        </div>

        {catProducts.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-[#E6DFD8] bg-white p-12 text-center">
            <p className="font-display text-2xl text-[#232220]">
              New pieces arriving soon in {activeCategory.name}
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-[#232220] px-6 py-2.5 text-xs font-medium text-white hover:bg-[#B68167]"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-3.5 gap-y-8 sm:mt-10 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
            {catProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="border-b border-[#E6DFD8] pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
          Curated Lines
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-[#232220] sm:text-5xl">
          Collections
        </h1>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {categories.map((cat) => {
          const count = products.filter(
            (p) => p.category.toLowerCase() === cat.name.toLowerCase()
          ).length;
          return (
            <Link
              key={cat.id}
              to={`/collections/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-[#E6DFD8] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F3EFEA]">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Sparkles className="h-8 w-8 text-[#B68167]" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#68625C] tabular-nums">
                    {count} {count === 1 ? 'Piece' : 'Pieces'}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-[#232220] group-hover:text-[#97634A] transition-colors">
                    {cat.name}
                  </h2>
                  {cat.description && (
                    <p className="mt-1 text-sm text-[#68625C] line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E6DFD8] text-[#232220] transition-colors group-hover:border-[#B68167] group-hover:bg-[#B68167] group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
