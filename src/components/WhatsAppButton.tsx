import React from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from './Formatters';
import { BRAND_INFO } from '../lib/firebase';

export const WhatsAppButton: React.FC = () => {
  return (
    <a
      href={buildWhatsAppUrl(
        `Assalam-o-Alaikum ${BRAND_INFO.name}, I would like to inquire about your clothing collection.`
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp (${BRAND_INFO.phone})`}
      className="group fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#232220] px-3.5 py-3 text-xs font-medium tracking-wide text-[#FAF9F7] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#B68167] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B68167]"
    >
      <MessageCircle className="h-4 w-4 text-[#DFB8A4] group-hover:text-white transition-colors" />
      <span className="hidden sm:inline whitespace-nowrap">WhatsApp</span>
    </a>
  );
};
