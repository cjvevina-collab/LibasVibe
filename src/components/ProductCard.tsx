import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { Product } from '../types/store';
import { useCart } from '../context/CartContext';
import { formatPKR } from './Formatters';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group flex flex-col min-w-0">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F3EFEA] border border-[#E6DFD8]">
        <Link
          to={`/product/${product.id}`}
          className="block h-full w-full focus-visible:outline-2 focus-visible:outline-[#B68167]"
        >
          {!imgError && product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F3EFEA] to-[#E8D5CB]/40 p-4 text-center">
              <Sparkles className="mb-2 h-5 w-5 text-[#B68167]" />
              <span className="font-display text-base font-medium text-[#232220]">
                {product.title}
              </span>
            </div>
          )}
        </Link>

        <button
          type="button"
          disabled={!product.inStock}
          onClick={() => addToCart(product, product.sizes?.[0] || 'M', 1)}
          aria-label={`Quick add ${product.title} to bag`}
          className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[11px] sm:px-3.5 sm:py-2 sm:text-xs font-medium text-[#232220] shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-[#232220] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#B68167]" />
          <span className="hidden xs:inline sm:inline">
            {product.inStock ? 'Add' : 'Sold'}
          </span>
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-0.5 sm:gap-1">
        <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.1em] text-[#68625C]">
          <span className="truncate">{product.category}</span>
          {!product.inStock && (
            <span className="text-[#97634A] shrink-0">Sold Out</span>
          )}
        </div>

        <Link
          to={`/product/${product.id}`}
          className="text-sm sm:text-base font-medium text-[#232220] transition-colors hover:text-[#97634A] line-clamp-1"
        >
          {product.title}
        </Link>

        <div className="flex items-baseline gap-2 text-xs sm:text-sm tabular-nums">
          <span className="font-semibold text-[#232220]">
            {formatPKR(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[11px] text-[#68625C] line-through">
              {formatPKR(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
