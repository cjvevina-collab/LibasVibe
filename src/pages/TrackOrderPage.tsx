import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types/store';
import { formatPKR, formatPKRDecimal } from '../components/Formatters';

export const TrackOrderPage: React.FC = () => {
  const { lookupOrderByCode } = useStore();
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim()) return;
    setSearching(true);
    setNotFound(false);
    try {
      const result = await lookupOrderByCode(orderCode, phone);
      setOrder(result);
      setNotFound(!result);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="border-b border-[#E6DFD8] pb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
          Order Lookup
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-[#232220]">
          Track Your Order
        </h1>
        <p className="mt-2 text-sm text-[#68625C]">
          Enter your LibasVibe Order ID (for example, LV-4821AB) and phone number.
        </p>
      </div>

      <form
        onSubmit={handleLookup}
        className="mt-8 rounded-2xl border border-[#E6DFD8] bg-white p-6 space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
              Order Code *
            </label>
            <input
              type="text"
              required
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="LV-XXXX"
              className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm uppercase text-[#232220] focus:border-[#B68167] focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XX XXXXXXX"
              className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm text-[#232220] focus:border-[#B68167] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={searching}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#232220] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#B68167] disabled:opacity-50"
        >
          <Search className="h-3.5 w-3.5" />
          <span>{searching ? 'Checking...' : 'Check Status'}</span>
        </button>
      </form>

      {notFound && (
        <div className="mt-6 rounded-xl border border-[#E6DFD8] bg-[#F3EFEA] p-5 text-sm text-[#68625C]">
          No order matched that Order Code and phone number. Please double-check your confirmation code or message us on WhatsApp at 03393923100.
        </div>
      )}

      {order && (
        <div className="mt-8 rounded-2xl border border-[#E6DFD8] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD8] pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#68625C]">
                Order #{order.orderCode}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-[#232220]">
                Status: {order.status}
              </h2>
            </div>
            <span className="text-xs text-[#68625C]">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-[#232220]">
                  {item.title} ({item.size}) × {item.quantity}
                </span>
                <span className="tabular-nums font-medium">
                  {formatPKR(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-2 text-xs text-[#68625C]">
              <span>Standard Delivery</span>
              <span className="tabular-nums">
                {formatPKRDecimal(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#E6DFD8] pt-3 font-semibold text-[#232220]">
              <span>Total</span>
              <span className="tabular-nums">{formatPKRDecimal(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
