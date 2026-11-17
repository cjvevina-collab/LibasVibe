import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { BRAND_INFO } from '../lib/firebase';

const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Ayesha Siddiqui',
    location: 'Lahore · Noor Ivory Raw Silk 3-Piece',
    quote:
      'The silk weight and neckline embroidery arrived exactly as photographed. Fitted true to size on my first order.',
  },
  {
    id: 't2',
    name: 'Hira Mansoor',
    location: 'Islamabad · Meher Rose-Copper Gown',
    quote:
      'Ordered for an evening dinner and received delivery within three days. The rose-copper organza dupatta drapes effortlessly.',
  },
  {
    id: 't3',
    name: 'Zainab Tariq',
    location: 'Karachi · Sahra Sand Linen Co-ord',
    quote:
      'Breathable cotton-linen with crisp pleated cuffs. Clean stitching inside and out, and WhatsApp sizing help was prompt.',
  },
  {
    id: 't4',
    name: 'Maham Raza',
    location: 'Rawalpindi · Shabnam Charcoal Damask Set',
    quote:
      'The damask jacquard fabric feels substantial yet light. Free delivery above Rs. 5,000 made checkout effortless.',
  },
  {
    id: 't5',
    name: 'Sana Farooq',
    location: 'Faisalabad · Zoya Mauve Organza Kaftan',
    quote:
      'Paid seamlessly via Easypaisa and received tracking updates right away. The kaftan neckline detailing looks truly bespoke.',
  },
];

const FAQS = [
  {
    q: 'What is the delivery fee and when is delivery free?',
    a: `Orders above Rs. ${BRAND_INFO.freeDeliveryThreshold.toLocaleString(
      'en-PK'
    )} qualify for Free Nationwide Delivery. Orders of Rs. ${BRAND_INFO.freeDeliveryThreshold.toLocaleString(
      'en-PK'
    )} or below have a flat Standard Delivery charge of Rs. ${BRAND_INFO.standardDeliveryFee.toFixed(
      2
    )}.`,
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept Cash on Delivery (COD), Easypaisa (03393923100 — Farhan), Bank Al Habib Ltd transfer (12340981001738016 — Farhan s/o Abdul Hameed), and WhatsApp order confirmation.',
  },
  {
    q: 'How can I verify my size before placing an order?',
    a: `Standard stitched sizes (XS, S, M, L, XL) follow tailored Pakistani pret measurements. Message or call us at ${BRAND_INFO.phone} for chest, length, and sleeve guidance before dispatch.`,
  },
  {
    q: 'How do I track my order after checkout?',
    a: 'Every completed checkout generates an Order Code (for example LV-4821AB). Visit the Track Order page and enter your Order Code and phone number to check live status.',
  },
];

function getMobileFocusClass(focus?: 'left' | 'center' | 'right'): string {
  if (focus === 'right') return 'object-[78%_18%] sm:object-center';
  if (focus === 'left') return 'object-[32%_18%] sm:object-center';
  return 'object-center';
}

export const HomePage: React.FC = () => {
  const { products, banners } = useStore();
  const activeBanners = useMemo(() => {
    const filtered = banners.filter((b) => b.active);
    return filtered.length > 0 ? filtered : banners;
  }, [banners]);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 6);
  const displayProducts =
    featuredProducts.length > 0 ? featuredProducts : products.slice(0, 6);

  const [activeSlide, setActiveSlide] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (activeSlide >= activeBanners.length && activeBanners.length > 0) {
      setActiveSlide(0);
    }
  }, [activeBanners.length, activeSlide]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = activeBanners[activeSlide] || activeBanners[0];

  const visibleTestimonials = useMemo(() => {
    const items = [];
    for (let i = 0; i < 3; i++) {
      items.push(TESTIMONIALS[(testimonialIndex + i) % TESTIMONIALS.length]);
    }
    return items;
  }, [testimonialIndex]);

  return (
    <div className="w-full">
      {/* 1. Full-Width Dynamic Hero Banner Slider */}
      {currentSlide && (
        <section
          aria-label="Featured Collections"
          className="relative w-full overflow-hidden bg-[#232220]"
        >
          <div className="relative min-h-[68vh] sm:min-h-[76vh] lg:min-h-[82vh] w-full flex items-end sm:items-center">
            {activeBanners.map((slide, idx) => (
              <img
                key={slide.id}
                src={slide.imageUrl}
                alt={slide.headline}
                referrerPolicy="no-referrer"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${getMobileFocusClass(
                  slide.mobileFocus
                )} ${idx === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              />
            ))}

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#232220]/85 via-[#232220]/35 to-transparent sm:bg-gradient-to-r sm:from-[#232220]/75 sm:via-[#232220]/30 sm:to-transparent"
            />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:py-20 lg:px-8">
              <div className="max-w-lg text-[#FAF9F7]">
                {currentSlide.kicker && (
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#DFB8A4]">
                    {currentSlide.kicker}
                  </p>
                )}
                <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl text-balance">
                  {currentSlide.headline}
                </h1>
                {currentSlide.subtitle && (
                  <p className="mt-3 text-sm sm:text-base text-[#FAF9F7]/85 max-w-sm">
                    {currentSlide.subtitle}
                  </p>
                )}
                <div className="mt-7">
                  <Link
                    to={currentSlide.buttonLink || '/shop'}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#FAF9F7] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#232220] transition-colors duration-200 hover:bg-[#5C1626] hover:text-white"
                  >
                    <span>{currentSlide.buttonLabel || 'Shop Collection'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {activeBanners.length > 1 && (
              <div className="absolute bottom-5 right-4 left-4 z-20 mx-auto flex max-w-7xl items-center justify-between sm:px-2 lg:px-4">
                <div className="flex items-center gap-2">
                  {activeBanners.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Show banner slide ${idx + 1}`}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === activeSlide
                          ? 'w-10 bg-[#DFB8A4]'
                          : 'w-4 bg-[#FAF9F7]/40 hover:bg-[#FAF9F7]/70'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSlide(
                        (prev) =>
                          (prev - 1 + activeBanners.length) % activeBanners.length
                      )
                    }
                    aria-label="Previous banner"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FAF9F7]/30 bg-[#232220]/40 text-[#FAF9F7] backdrop-blur-sm transition-colors hover:border-[#DFB8A4] hover:bg-[#232220]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSlide((prev) => (prev + 1) % activeBanners.length)
                    }
                    aria-label="Next banner"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#FAF9F7]/30 bg-[#232220]/40 text-[#FAF9F7] backdrop-blur-sm transition-colors hover:border-[#DFB8A4] hover:bg-[#232220]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Featured Collection Grid (2 columns on mobile, 3 on desktop) */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E6DFD8] pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
              Curated Edit
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-[#232220] sm:text-4xl">
              Signature Ensembles
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#232220] hover:text-[#B68167] transition-colors whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-3.5 gap-y-8 sm:mt-10 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. Sliding Client Testimonials (5 Total) */}
      <section className="w-full border-t border-[#E6DFD8] bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex items-end justify-between gap-4 border-b border-[#E6DFD8] pb-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
                Client Notes
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-[#232220] sm:text-4xl">
                Worn &amp; Reviewed
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setTestimonialIndex(
                    (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
                  )
                }
                aria-label="Previous testimonial"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E6DFD8] bg-[#FAF9F7] text-[#232220] hover:border-[#B68167]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length)
                }
                aria-label="Next testimonial"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E6DFD8] bg-[#FAF9F7] text-[#232220] hover:border-[#B68167]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile: 1 sliding testimonial; Desktop: 3 sliding testimonials */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {visibleTestimonials.map((item, idx) => (
              <blockquote
                key={`${item.id}-${idx}`}
                className={`${
                  idx > 0 ? 'hidden md:flex' : 'flex'
                } flex-col justify-between rounded-2xl border border-[#E6DFD8] bg-[#FAF9F7] p-6 transition-all duration-300`}
              >
                <div>
                  <div className="flex items-center gap-1 text-[#B68167]">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star
                        key={star}
                        className="h-3.5 w-3.5 fill-[#B68167] text-[#B68167]"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[#232220]">
                    “{item.quote}”
                  </p>
                </div>
                <footer className="mt-6 border-t border-[#E6DFD8] pt-4">
                  <p className="text-sm font-semibold text-[#232220]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#68625C]">{item.location}</p>
                </footer>
              </blockquote>
            ))}
          </div>

          {/* Slide Dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTestimonialIndex(idx)}
                aria-label={`View testimonial ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === testimonialIndex
                    ? 'w-7 bg-[#5C1626]'
                    : 'w-2 bg-[#E6DFD8] hover:bg-[#B68167]'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAQs Accordion */}
      <section className="w-full border-t border-[#E6DFD8] bg-[#FAF9F7]">
        <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="border-b border-[#E6DFD8] pb-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
              Questions
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-[#232220] sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-4 divide-y divide-[#E6DFD8]">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={faq.q} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="text-base font-medium text-[#232220]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#B68167] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm leading-relaxed text-[#68625C] pr-6">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
