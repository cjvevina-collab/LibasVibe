import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BRAND_INFO } from '../lib/firebase';
import { HERO_BANNER_IMAGE } from '../data/seedCatalog';

export const AboutPage: React.FC = () => {
  const [logoSrc, setLogoSrc] = useState(BRAND_INFO.logoUrl);

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
              Our House
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-[#232220] sm:text-5xl text-balance">
              LibasVibe by FARHAN
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[#68625C]">
              Founded with a devotion to understated elegance, LibasVibe by FARHAN blends traditional textile heritage with clean contemporary silhouettes. Every ensemble is thoughtfully tailored in breathable raw silk, woven jacquard damask, pure cotton-linen, and gossamer organza.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#68625C]">
              From effortless everyday pret to rose-copper accented festive couture, our focus remains singular: enduring comfort, balanced proportion, and attentive personal service from our atelier to your wardrobe.
            </p>

            <div className="mt-8 flex items-center gap-4 border-t border-[#E6DFD8] pt-6">
              <img
                src={logoSrc}
                alt={BRAND_INFO.name}
                referrerPolicy="no-referrer"
                onError={() => {
                  if (logoSrc !== BRAND_INFO.fallbackLogoUrl) {
                    setLogoSrc(BRAND_INFO.fallbackLogoUrl);
                  }
                }}
                className="h-14 w-14 rounded-full object-cover border border-[#E6DFD8]"
              />
              <div>
                <p className="font-display text-xl font-semibold text-[#232220]">
                  {BRAND_INFO.domain}
                </p>
                <p className="text-xs text-[#68625C]">
                  Direct Concierge: {BRAND_INFO.phone} · {BRAND_INFO.email}
                </p>
              </div>
            </div>

            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#232220] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#B68167]"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-[#E6DFD8] bg-[#F3EFEA]">
              <img
                src={HERO_BANNER_IMAGE}
                alt="LibasVibe Couture Atelier"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
