import React, { useState } from 'react';
import { ExternalLink, Mail, MessageCircle, Phone } from 'lucide-react';
import { BRAND_INFO } from '../lib/firebase';
import { buildWhatsAppUrl } from '../components/Formatters';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const composed = `Assalam-o-Alaikum ${BRAND_INFO.name},\nName: ${
      name || 'Customer'
    }\nMessage: ${message}`;
    window.open(buildWhatsAppUrl(composed), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="border-b border-[#E6DFD8] pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
          Concierge
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-[#232220] sm:text-5xl">
          Get in Touch
        </h1>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[#E6DFD8] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#97634A]">
              Call &amp; WhatsApp
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-[#232220]">
              {BRAND_INFO.phone}
            </p>
            <p className="mt-1 text-sm text-[#68625C]">
              Available for calls and WhatsApp order assistance.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`tel:${BRAND_INFO.phone}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#E6DFD8] px-4 py-2 text-xs font-medium text-[#232220] hover:border-[#B68167]"
              >
                <Phone className="h-3.5 w-3.5 text-[#B68167]" />
                <span>Call Now</span>
              </a>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#232220] px-4 py-2 text-xs font-medium text-white hover:bg-[#B68167]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Open WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E6DFD8] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#97634A]">
              Email &amp; Socials
            </p>
            <a
              href={`mailto:${BRAND_INFO.email}`}
              className="mt-3 flex items-center gap-2.5 text-sm font-medium text-[#232220] hover:text-[#97634A]"
            >
              <Mail className="h-4 w-4 text-[#B68167]" />
              <span>{BRAND_INFO.email}</span>
            </a>

            <div className="mt-5 flex flex-wrap gap-3 border-t border-[#E6DFD8] pt-4">
              <a
                href={BRAND_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E6DFD8] px-4 py-2 text-xs font-medium text-[#232220] hover:border-[#B68167]"
              >
                <span>Instagram</span>
                <ExternalLink className="h-3 w-3 text-[#68625C]" />
              </a>
              <a
                href={BRAND_INFO.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E6DFD8] px-4 py-2 text-xs font-medium text-[#232220] hover:border-[#B68167]"
              >
                <span>Facebook</span>
                <ExternalLink className="h-3 w-3 text-[#68625C]" />
              </a>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleWhatsAppSubmit}
          className="lg:col-span-7 rounded-2xl border border-[#E6DFD8] bg-white p-6 sm:p-8 space-y-5"
        >
          <h2 className="font-display text-2xl font-semibold text-[#232220]">
            Direct Inquiry
          </h2>
          <p className="text-sm text-[#68625C]">
            Send a direct message to our WhatsApp desk ({BRAND_INFO.phone}).
          </p>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm text-[#232220] focus:border-[#B68167] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
              Message
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about sizing, custom tailoring, or your order..."
              className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm text-[#232220] focus:border-[#B68167] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-[#232220] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#B68167]"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Send via WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
};
