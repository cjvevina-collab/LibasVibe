import React from 'react';
import { buildWhatsAppUrl } from './Formatters';
import { BRAND_INFO } from '../lib/firebase';
import { WhatsAppIcon } from './WhatsAppIcon';

export const WhatsAppButton: React.FC = () => {
  return (
    <a
      href={buildWhatsAppUrl(
        `Assalam-o-Alaikum ${BRAND_INFO.name}, I would like to inquire about your clothing collection.`
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp (${BRAND_INFO.phone})`}
      className="fixed bottom-5 left-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-[#1ebe5d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <WhatsAppIcon className="h-6 w-6 text-white" />
    </a>
  );
};
