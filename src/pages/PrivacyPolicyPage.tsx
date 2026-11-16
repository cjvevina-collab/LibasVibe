import React from 'react';
import { BRAND_INFO } from '../lib/firebase';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="border-b border-[#E6DFD8] pb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
          Legal
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-[#232220]">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs text-[#68625C]">
          Effective for {BRAND_INFO.name} ({BRAND_INFO.domain})
        </p>
      </div>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#68625C]">
        <section>
          <h2 className="font-display text-2xl font-semibold text-[#232220]">
            1. Information We Collect
          </h2>
          <p className="mt-2">
            When you place an order on {BRAND_INFO.domain}, we collect only the details needed to fulfill and deliver your garments: your full name, phone/WhatsApp number, delivery street address, city, and optional email address or sizing notes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-[#232220]">
            2. How We Use Your Details
          </h2>
          <p className="mt-2">
            Your contact and address information is used solely to confirm orders, coordinate nationwide courier dispatch, provide order tracking updates, and assist with sizing inquiries via phone or WhatsApp ({BRAND_INFO.phone}).
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-[#232220]">
            3. Data Protection &amp; Sharing
          </h2>
          <p className="mt-2">
            {BRAND_INFO.name} does not sell, rent, or trade your personal details with third parties. Delivery details are shared exclusively with trusted logistics partners strictly for parcel delivery.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-[#232220]">
            4. Contact Regarding Privacy
          </h2>
          <p className="mt-2">
            For any questions or requests to update or remove your order details, reach out to us at{' '}
            <a
              href={`mailto:${BRAND_INFO.email}`}
              className="text-[#97634A] underline"
            >
              {BRAND_INFO.email}
            </a>{' '}
            or call {BRAND_INFO.phone}.
          </p>
        </section>
      </div>
    </div>
  );
};
