import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import { BRAND_INFO } from '../lib/firebase';
import { buildWhatsAppUrl } from './Formatters';
import { WhatsAppIcon } from './WhatsAppIcon';

export const Footer: React.FC = () => {
  const [logoSrc, setLogoSrc] = useState(BRAND_INFO.logoUrl);

  return (
    <footer className="w-full border-t border-[#E6DFD8] bg-[#F3EFEA] text-[#232220]">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4">
              <img
                src={logoSrc}
                alt={BRAND_INFO.name}
                referrerPolicy="no-referrer"
                onError={() => {
                  if (logoSrc !== BRAND_INFO.fallbackLogoUrl) {
                    setLogoSrc(BRAND_INFO.fallbackLogoUrl);
                  }
                }}
                className="h-20 w-20 rounded-full bg-white p-1 object-contain border border-[#E6DFD8] shadow-xs shrink-0"
              />
              <div>
                <p className="font-display text-2xl font-semibold text-[#232220]">
                  {BRAND_INFO.name}
                </p>
                <p className="text-xs text-[#68625C]">{BRAND_INFO.domain}</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#68625C]">
              Refined contemporary pret, festive couture, and artisanal ensembles crafted with quiet luxury and effortless drape.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#232220]">
              Pages
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#68625C]">
              <li>
                <Link to="/shop" className="hover:text-[#232220] transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-[#232220] transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-[#232220] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#232220] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#232220] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#232220]">
              Connect
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#68625C]">
              <li>
                <a
                  href={`tel:${BRAND_INFO.phone}`}
                  className="inline-flex items-center gap-2 hover:text-[#232220] transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-[#B68167]" />
                  <span>{BRAND_INFO.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BRAND_INFO.email}`}
                  className="inline-flex items-center gap-2 hover:text-[#232220] transition-colors break-all"
                >
                  <Mail className="h-3.5 w-3.5 text-[#B68167] shrink-0" />
                  <span>{BRAND_INFO.email}</span>
                </a>
              </li>

              {/* Social Media Icons Only */}
              <li className="pt-2 flex items-center gap-3">
                <a
                  href={BRAND_INFO.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LibasVibe Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6DFD8] bg-white text-[#232220] transition-colors hover:border-[#B68167] hover:text-[#B68167]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                <a
                  href={BRAND_INFO.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LibasVibe Facebook"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6DFD8] bg-white text-[#232220] transition-colors hover:border-[#B68167] hover:text-[#B68167]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LibasVibe WhatsApp"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6DFD8] bg-white text-[#25D366] transition-colors hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#E6DFD8] pt-6 text-xs text-[#68625C] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {BRAND_INFO.name} ({BRAND_INFO.domain}). All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/privacy-policy" className="hover:text-[#232220] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#232220] transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/track-order" className="hover:text-[#232220] transition-colors">
              Order Status
            </Link>
            <Link to="/admin" className="hover:text-[#232220] transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
