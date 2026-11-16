import React from 'react';
import { BRAND_INFO } from '../lib/firebase';

export const TermsPage: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="border-b border-[#E6DFD8] pb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
          Legal
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-[#232220]">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-xs text-[#68625C]">
          Applies to orders placed on {BRAND_INFO.domain}
        </p>
      </div>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#68625C]">
        <section>
          <h2 className="font-display text-2xl font-semibold text-[#232220]">
            1. Orders &amp; Pricing
          </h2>
          <p className="mt-2">
            All garment prices listed on {BRAND_INFO.domain} are in Pakistani Rupees (PKR). Standard Delivery is charged at a flat rate of Rs. {BRAND_INFO.standardDeliveryFee.toFixed(2)} nationwide unless otherwise stated.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-[#232220]">
            2. Dispatch &amp; Cash on Delivery
          </h2>
          <p className="mt-2">
            Stitched ensembles are dispatched within 24 to 48 hours of order confirmation. Please inspect your package before completing Cash on Delivery payment and ensure a valid reachable phone number is provided at checkout.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-[#232220]">
            3. Exchanges &amp; Size Support
          </h2>
          <p className="mt-2">
            Unworn garments with original tags intact may be exchanged within 7 days of delivery for sizing adjustments, subject to availability. Contact {BRAND_INFO.phone} or email {BRAND_INFO.email} with your Order Code to initiate an exchange.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-[#232220]">
            4. Fabric &amp; Color Representation
          </h2>
          <p className="mt-2">
            While every garment is photographed under calibrated studio daylight, slight tonal variations may appear depending on individual screen displays.
          </p>
        </section>
      </div>
    </div>
  );
};
