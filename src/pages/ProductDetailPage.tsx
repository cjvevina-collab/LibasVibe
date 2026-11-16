import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { ProductSize } from '../types/store';
import { buildWhatsAppUrl, formatPKR } from '../components/Formatters';
import { BRAND_INFO } from '../lib/firebase';
import { ProductCard } from '../components/ProductCard';

interface ProductReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
}

const DEFAULT_REVIEWS: ProductReview[] = [
  {
    id: 'r1',
    author: 'Maham Raza',
    city: 'Lahore',
    rating: 5,
    comment:
      'Beautiful stitching and premium fabric weight. The rose-copper detailing looks even finer in person.',
    date: 'November 2026',
  },
  {
    id: 'r2',
    author: 'Sana Farooq',
    city: 'Karachi',
    rating: 5,
    comment:
      'True to size and arrived neatly packed within three days. Will definitely order again from LibasVibe.',
    date: 'November 2026',
  },
  {
    id: 'r3',
    author: 'Nadia Usman',
    city: 'Islamabad',
    rating: 4,
    comment:
      'Very comfortable drape for long evening wear. WhatsApp support helped me pick the right size.',
    date: 'October 2026',
  },
];

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useStore();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    product?.sizes?.[0] || 'M'
  );
  const [quantity, setQuantity] = useState(1);

  // Live product viewer count
  const baseViewers = useMemo(() => {
    if (!id) return 11;
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash * 31 + id.charCodeAt(i)) % 14;
    }
    return 9 + hash;
  }, [id]);
  const [viewerCount, setViewerCount] = useState(baseViewers);

  useEffect(() => {
    setViewerCount(baseViewers);
    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.min(26, Math.max(7, prev + delta));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [baseViewers]);

  // Customer reviews state
  const [reviews, setReviews] = useState<ProductReview[]>(DEFAULT_REVIEWS);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerCity, setReviewerCity] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#232220]">
          Ensemble Not Found
        </h1>
        <p className="mt-2 text-sm text-[#68625C]">
          This garment may have been moved or sold out.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-full bg-[#232220] px-6 py-3 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#B68167]"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  const avgRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;
    setReviews((prev) => [
      {
        id: `rev-${Date.now()}`,
        author: reviewerName.trim(),
        city: reviewerCity.trim() || 'Pakistan',
        rating: reviewRating,
        comment: reviewComment.trim(),
        date: 'Just now',
      },
      ...prev,
    ]);
    setReviewerName('');
    setReviewerCity('');
    setReviewComment('');
    setReviewRating(5);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const whatsappMsg = `Assalam-o-Alaikum LibasVibe by FARHAN, I would like to order:\n• ${product.title}${
    product.sku ? ` (${product.sku})` : ''
  }\n• Size: ${selectedSize}\n• Quantity: ${quantity}\n• Price: ${formatPKR(
    product.price
  )}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#68625C] hover:text-[#232220]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Shop</span>
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        {/* Sticky Left Image */}
        <div className="lg:col-span-7 lg:sticky lg:top-24">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[#E6DFD8] bg-[#F3EFEA]">
            <img
              src={product.imageUrl}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>

        {/* Contiguous Purchase Module */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#97634A]">
            <span>{product.category}</span>
            {product.sku && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#68625C]">{product.sku}</span>
              </>
            )}
          </div>

          <h1 className="mt-2 font-display text-3xl font-semibold text-[#232220] sm:text-4xl">
            {product.title}
          </h1>

          {/* Rating & Live Viewing Indicator */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#68625C]">
            <div className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-[#B68167] text-[#B68167]" />
              <span className="font-semibold text-[#232220] tabular-nums">
                {avgRating}
              </span>
              <span>({reviews.length} reviews)</span>
            </div>
            <span aria-hidden="true">·</span>
            <div className="inline-flex items-center gap-1.5 text-[#97634A]">
              <Eye className="h-3.5 w-3.5" />
              <span className="tabular-nums">
                {viewerCount} people viewing right now
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-3 tabular-nums">
            <span className="text-2xl font-semibold text-[#232220]">
              {formatPKR(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-[#68625C] line-through">
                {formatPKR(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-[#68625C]">
            {product.description}
          </p>

          {product.fabric && (
            <div className="mt-5 border-t border-b border-[#E6DFD8] py-3.5 text-sm">
              <span className="font-medium text-[#232220]">Fabric: </span>
              <span className="text-[#68625C]">{product.fabric}</span>
            </div>
          )}

          {/* Size Selector */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#232220]">
                Select Size
              </span>
              <span className="text-xs text-[#68625C]">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2.5">
              {(product.sizes || ['S', 'M', 'L']).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] rounded-lg border px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                    selectedSize === size
                      ? 'border-[#232220] bg-[#232220] text-white'
                      : 'border-[#E6DFD8] bg-white text-[#232220] hover:border-[#B68167]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Bag */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <div className="inline-flex h-12 items-center justify-between rounded-full border border-[#E6DFD8] bg-white px-3 sm:w-36">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-8 w-8 items-center justify-center text-[#232220] hover:text-[#B68167]"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-medium tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="flex h-8 w-8 items-center justify-center text-[#232220] hover:text-[#B68167]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={!product.inStock}
              onClick={() => addToCart(product, selectedSize, quantity)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#232220] px-6 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#B68167] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{product.inStock ? 'Add to Bag' : 'Sold Out'}</span>
            </button>
          </div>

          <a
            href={buildWhatsAppUrl(whatsappMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#E6DFD8] bg-white px-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#232220] transition-colors hover:border-[#B68167] hover:text-[#97634A]"
          >
            <MessageCircle className="h-4 w-4 text-[#B68167]" />
            <span>Order on WhatsApp ({BRAND_INFO.phone})</span>
          </a>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#E6DFD8] bg-[#F3EFEA]/70 p-4 text-xs text-[#68625C]">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#B68167]" />
            <div>
              <p className="font-medium text-[#232220]">
                Standard Delivery Rs. {BRAND_INFO.standardDeliveryFee.toFixed(2)}
              </p>
              <p className="mt-0.5">
                Cash on delivery available nationwide. Dispatch within 24–48 hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mt-16 border-t border-[#E6DFD8] pt-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
              Feedback
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-[#232220]">
              Customer Reviews
            </h2>

            <div className="mt-6 space-y-4">
              {reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="rounded-2xl border border-[#E6DFD8] bg-white p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-3.5 w-3.5 ${
                            n <= rev.rating
                              ? 'fill-[#B68167] text-[#B68167]'
                              : 'text-[#E6DFD8]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#68625C]">{rev.date}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#232220]">
                    {rev.comment}
                  </p>
                  <p className="mt-3 text-xs font-medium text-[#68625C]">
                    {rev.author} · {rev.city}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmitReview}
            className="lg:col-span-5 rounded-2xl border border-[#E6DFD8] bg-white p-6 space-y-4 h-fit"
          >
            <h3 className="font-display text-2xl font-semibold text-[#232220]">
              Leave a Review
            </h3>
            {reviewSubmitted && (
              <p className="rounded-lg bg-[#F3EFEA] px-3 py-2 text-xs font-medium text-[#97634A]">
                Thank you — your review has been added.
              </p>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Your Name"
                className="rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
              />
              <input
                type="text"
                value={reviewerCity}
                onChange={(e) => setReviewerCity(e.target.value)}
                placeholder="City"
                className="rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-xs uppercase tracking-wider text-[#68625C]">
                Rating
              </span>
              <div className="mt-1.5 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewRating(n)}
                    aria-label={`Rate ${n} stars`}
                    className="p-1"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        n <= reviewRating
                          ? 'fill-[#B68167] text-[#B68167]'
                          : 'text-[#E6DFD8]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              required
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your thoughts on fabric, fit, and delivery..."
              className="w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm focus:border-[#B68167] focus:bg-white focus:outline-none"
            />

            <button
              type="submit"
              className="w-full rounded-full bg-[#232220] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#B68167]"
            >
              Submit Review
            </button>
          </form>
        </div>
      </section>

      {/* Related Ensembles (2-column mobile grid) */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-[#E6DFD8] pt-14">
          <h2 className="font-display text-3xl font-semibold text-[#232220]">
            You May Also Like
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-3.5 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
