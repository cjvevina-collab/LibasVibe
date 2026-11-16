import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { BRAND_INFO } from '../lib/firebase';
import { useCart } from '../context/CartContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/collections', label: 'Collections' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export const Header: React.FC = () => {
  const { totalItems, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState(BRAND_INFO.logoUrl);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#E6DFD8]">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:gap-8 sm:px-6 lg:px-8">
        {/* Zone 1: Brand mark with larger prominent circular logo */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B68167]"
        >
          <img
            src={logoSrc}
            alt="LibasVibe by FARHAN"
            referrerPolicy="no-referrer"
            onError={() => {
              if (logoSrc !== BRAND_INFO.fallbackLogoUrl) {
                setLogoSrc(BRAND_INFO.fallbackLogoUrl);
              }
            }}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border border-[#B68167]/50 shadow-xs"
          />
          <span className="font-display text-2xl sm:text-[26px] font-semibold tracking-tight text-[#232220]">
            LibasVibe
          </span>
        </Link>

        {/* Zone 2: Short single-line nav links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#68625C]"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#232220] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#B68167]'
                    : 'hover:text-[#232220]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Single primary action (Bag) + mobile menu toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Open shopping bag (${totalItems} items)`}
            className="inline-flex items-center gap-2 rounded-full border border-[#E6DFD8] bg-white px-4 py-2 text-xs font-medium tracking-wide text-[#232220] transition-colors duration-150 hover:border-[#B68167] hover:text-[#97634A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B68167]"
          >
            <ShoppingBag className="h-4 w-4 text-[#B68167]" />
            <span>Bag</span>
            <span className="tabular-nums text-[#68625C]">({totalItems})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E6DFD8] bg-white text-[#232220] md:hidden"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#E6DFD8] bg-[#FAF9F7] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F3EFEA] text-[#97634A]'
                      : 'text-[#232220] hover:bg-[#F3EFEA]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/track-order"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#68625C] hover:bg-[#F3EFEA] hover:text-[#232220]"
            >
              Track Order
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
};
