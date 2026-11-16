import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPKR, formatPKRDecimal } from './Formatters';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    subtotal,
    deliveryFee,
    grandTotal,
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div
        onClick={closeDrawer}
        className="fixed inset-0 bg-[#232220]/40 backdrop-blur-[2px] transition-opacity"
      />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#FAF9F7] shadow-2xl border-l border-[#E6DFD8]">
        <div className="flex items-center justify-between border-b border-[#E6DFD8] px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-4 w-4 text-[#B68167]" />
            <h2 className="font-display text-2xl font-semibold text-[#232220]">
              Your Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close bag"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E6DFD8] bg-white text-[#232220] hover:border-[#B68167]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3EFEA] text-[#B68167]">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <p className="font-display text-2xl font-medium text-[#232220]">
                Your bag is empty
              </p>
              <p className="mt-2 max-w-xs text-sm text-[#68625C]">
                Explore our contemporary pret and festive couture ensembles.
              </p>
              <Link
                to="/shop"
                onClick={closeDrawer}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#232220] px-6 py-2.5 text-xs font-medium tracking-wide text-white transition-colors hover:bg-[#B68167]"
              >
                Explore Shop
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#E6DFD8]">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-4 py-5 first:pt-0"
                >
                  <Link
                    to={`/product/${item.productId}`}
                    onClick={closeDrawer}
                    className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F3EFEA] border border-[#E6DFD8]"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.productId}`}
                          onClick={closeDrawer}
                          className="text-sm font-medium text-[#232220] hover:text-[#97634A] truncate"
                        >
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.size)}
                          aria-label={`Remove ${item.title}`}
                          className="text-[#68625C] hover:text-red-700 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-[#68625C]">
                        Size {item.size}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-[#E6DFD8] bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          aria-label="Decrease quantity"
                          className="flex h-7 w-7 items-center justify-center text-[#232220] hover:text-[#B68167]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-medium tabular-nums text-[#232220]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          aria-label="Increase quantity"
                          className="flex h-7 w-7 items-center justify-center text-[#232220] hover:text-[#B68167]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold tabular-nums text-[#232220]">
                        {formatPKR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#E6DFD8] bg-white px-6 py-5">
            <div className="space-y-2 text-sm">
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

            <Link
              to="/checkout"
              onClick={closeDrawer}
              className="mt-5 flex w-full items-center justify-center rounded-full bg-[#232220] px-6 py-3.5 text-xs font-medium tracking-[0.08em] uppercase text-white transition-colors hover:bg-[#B68167]"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
};
