import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { Order } from '../types/store';
import {
  buildWhatsAppUrl,
  formatPKR,
  formatPKRDecimal,
} from '../components/Formatters';
import { BRAND_INFO } from '../lib/firebase';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, deliveryFee, grandTotal, clearCart } = useCart();
  const { placeOrder } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'WhatsApp'>('COD');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Your bag is empty.');
      return;
    }
    if (customerName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 7) {
      setError('Please enter a valid phone / WhatsApp number.');
      return;
    }
    if (address.trim().length < 5 || city.trim().length < 2) {
      setError('Please enter your complete delivery address and city.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await placeOrder({
        customerName,
        phone,
        email,
        address,
        city,
        notes,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          imageUrl: i.imageUrl,
          size: i.size,
          quantity: i.quantity,
        })),
        subtotal,
      });

      clearCart();
      setConfirmedOrder(order);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to place order right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    const waSummary = `Assalam-o-Alaikum ${BRAND_INFO.name}, I placed order ${confirmedOrder.orderCode}:\nName: ${confirmedOrder.customerName}\nPhone: ${confirmedOrder.phone}\nCity: ${confirmedOrder.city}\nTotal: ${formatPKRDecimal(confirmedOrder.total)}`;

    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-[#E6DFD8] bg-white p-8 sm:p-10">
          <div className="flex items-center gap-3 text-[#97634A]">
            <CheckCircle2 className="h-7 w-7" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
              Order Saved
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-semibold text-[#232220] sm:text-4xl">
            Order #{confirmedOrder.orderCode} Confirmed
          </h1>
          <p className="mt-2 text-sm text-[#68625C]">
            Thank you, {confirmedOrder.customerName}. Your order is saved in our system and is currently{' '}
            <span className="font-medium text-[#232220]">{confirmedOrder.status}</span>.
          </p>

          <div className="mt-6 rounded-xl bg-[#FAF9F7] border border-[#E6DFD8] p-5 text-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#68625C]">
                  Delivery To
                </p>
                <p className="mt-1 font-medium text-[#232220]">
                  {confirmedOrder.address}, {confirmedOrder.city}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#68625C]">
                  Contact Number
                </p>
                <p className="mt-1 font-medium text-[#232220]">
                  {confirmedOrder.phone}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-[#E6DFD8] pt-4 space-y-2">
              {confirmedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#232220]">
                    {item.title} ({item.size}) × {item.quantity}
                  </span>
                  <span className="tabular-nums font-medium text-[#232220]">
                    {formatPKR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-xs text-[#68625C]">
                <span>Standard Delivery</span>
                <span className="tabular-nums">
                  {formatPKRDecimal(confirmedOrder.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#E6DFD8] pt-2 text-base font-semibold text-[#232220]">
                <span>Total Payable ({confirmedOrder.paymentMethod})</span>
                <span className="tabular-nums">
                  {formatPKRDecimal(confirmedOrder.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={buildWhatsAppUrl(waSummary)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#232220] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#B68167]"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Share on WhatsApp</span>
            </a>
            <Link
              to="/track-order"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-[#E6DFD8] bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#232220] hover:border-[#B68167]"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3EFEA] text-[#B68167]">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-[#232220]">
          Your bag is empty
        </h1>
        <p className="mt-2 text-sm text-[#68625C]">
          Add an ensemble to your bag before checking out.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-full bg-[#232220] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#B68167]"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="border-b border-[#E6DFD8] pb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#97634A]">
          Checkout
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-[#232220]">
          Complete Your Order
        </h1>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 space-y-6 rounded-2xl border border-[#E6DFD8] bg-white p-6 sm:p-8"
        >
          <h2 className="font-display text-2xl font-semibold text-[#232220]">
            Shipping Details
          </h2>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ayesha Khan"
                className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm text-[#232220] focus:border-[#B68167] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                Phone / WhatsApp *
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lahore / Karachi / Islamabad"
                className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm text-[#232220] focus:border-[#B68167] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm text-[#232220] focus:border-[#B68167] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
              Complete Street Address *
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House #, Street, Sector / Area"
              className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm text-[#232220] focus:border-[#B68167] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
              Payment Method
            </label>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`rounded-xl border p-3.5 text-left text-sm transition-colors ${
                  paymentMethod === 'COD'
                    ? 'border-[#232220] bg-[#FAF9F7] font-medium text-[#232220]'
                    : 'border-[#E6DFD8] text-[#68625C] hover:border-[#B68167]'
                }`}
              >
                Cash on Delivery (COD)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('WhatsApp')}
                className={`rounded-xl border p-3.5 text-left text-sm transition-colors ${
                  paymentMethod === 'WhatsApp'
                    ? 'border-[#232220] bg-[#FAF9F7] font-medium text-[#232220]'
                    : 'border-[#E6DFD8] text-[#68625C] hover:border-[#B68167]'
                }`}
              >
                Confirm via WhatsApp
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#68625C]">
              Order Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any delivery instructions or sizing notes"
              className="mt-1.5 w-full rounded-lg border border-[#E6DFD8] bg-[#FAF9F7] px-3.5 py-2.5 text-sm text-[#232220] focus:border-[#B68167] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#232220] px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#B68167] disabled:opacity-50"
          >
            {submitting
              ? 'Saving Order...'
              : `Place Order — ${formatPKRDecimal(grandTotal)}`}
          </button>
        </form>

        {/* Summary */}
        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-[#E6DFD8] bg-white p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-[#232220]">
              Order Summary
            </h2>

            <ul className="mt-6 divide-y divide-[#E6DFD8]">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="flex items-center gap-4 py-4 first:pt-0"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="h-16 w-14 rounded-lg object-cover border border-[#E6DFD8] bg-[#F3EFEA]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#232220] truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#68625C]">
                      Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-[#232220]">
                    {formatPKR(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-[#E6DFD8] pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-[#68625C]">
                <span>Subtotal</span>
                <span className="tabular-nums text-[#232220]">
                  {formatPKRDecimal(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#68625C]">
                <span>Standard Delivery</span>
                <span className="tabular-nums text-[#232220]">
                  {formatPKRDecimal(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#E6DFD8] pt-3 text-base font-semibold text-[#232220]">
                <span>Total</span>
                <span className="tabular-nums">{formatPKRDecimal(grandTotal)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
