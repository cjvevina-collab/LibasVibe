import React from 'react';
import { BRAND_INFO } from '../lib/firebase';

const MARQUEE_ITEMS = [
  `Free Delivery Above Rs. ${BRAND_INFO.freeDeliveryThreshold.toLocaleString('en-PK')}`,
  `Standard Delivery Rs. ${BRAND_INFO.standardDeliveryFee.toFixed(2)} Nationwide`,
  'LibasVibe by FARHAN · Contemporary Pret & Couture',
  'Cash on Delivery, Easypaisa & Bank Al Habib Accepted',
  `WhatsApp & Call Concierge: ${BRAND_INFO.phone}`,
];

export const AnnouncementMarquee: React.FC = () => {
  return (
    <div className="relative h-8 w-full max-w-full overflow-hidden bg-[#232220] text-[#FAF9F7] flex items-center border-b border-[#383633]">
      <div className="animate-lv-marquee items-center text-[11px] font-medium tracking-[0.14em] uppercase whitespace-nowrap">
        {[0, 1].map((loopIndex) => (
          <div key={loopIndex} className="flex items-center">
            {MARQUEE_ITEMS.map((item, idx) => (
              <span key={`${loopIndex}-${idx}`} className="inline-flex items-center">
                <span className="px-6">{item}</span>
                <span
                  aria-hidden="true"
                  className="text-[#DFB8A4] text-[10px]"
                >
                  /
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
