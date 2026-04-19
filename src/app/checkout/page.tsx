'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { placeOrder } from '@/lib/actions/orders';
import { Trash2, Plus, Minus, CheckCircle } from 'lucide-react';
import type { CartBooking, CartProduct } from '@/lib/cart-context';

export default function CheckoutPage() {
  const { items, removeItem, updateQty, total, clear } = useCart();
  const [confirmed, setConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pointsEarned = Math.floor(total);

  async function handlePay() {
    setProcessing(true);
    setError(null);
    try {
      const products = items
        .filter((i): i is CartProduct => i.type === 'product')
        .map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPrice: i.product.price,
        }));
      const bookings = items
        .filter((i): i is CartBooking => i.type === 'booking')
        .map((i) => ({
          slotId: i.slotId,
          courtId: i.courtId,
          date: i.date,
          startTime: i.time,
          price: i.price,
        }));
      const result = await placeOrder(products, bookings);
      if (!result.success) {
        setError(result.error ?? 'Something went wrong.');
        return;
      }
      clear();
      setConfirmed(true);
    } finally {
      setProcessing(false);
    }
  }

  if (confirmed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle size={64} className="text-green-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment confirmed!</h1>
        <p className="text-gray-500 mb-2">
          Your booking and order have been processed successfully.
        </p>
        <p className="text-green-700 font-semibold text-sm mb-8">
          +{pointsEarned} points added to your account
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 mb-8">
          <p className="font-semibold mb-1">Stripe test mode</p>
          <p>
            No real charge was made. Card number 4242 4242 4242 4242 was used for demonstration.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-green-700 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-800 transition-colors"
          >
            View My Points
          </Link>
          <Link
            href="/"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
      <p className="text-gray-500 mb-8">Review your items before paying.</p>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">Your cart is empty.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/store" className="text-green-700 font-semibold hover:underline">
              Browse the store
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/booking" className="text-green-700 font-semibold hover:underline">
              Book a court
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.id)}
                onQty={(delta) => updateQty(item.id, delta)}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                {items.map((item) => {
                  const label =
                    item.type === 'product'
                      ? `${(item as CartProduct).product.name} x${(item as CartProduct).quantity}`
                      : `${(item as CartBooking).courtName} — ${(item as CartBooking).timeLabel}`;
                  const price =
                    item.type === 'product'
                      ? (item as CartProduct).product.price * (item as CartProduct).quantity
                      : (item as CartBooking).price;
                  return (
                    <div key={item.id} className="flex justify-between text-gray-600">
                      <span className="truncate max-w-[160px]">{label}</span>
                      <span className="font-medium">${price.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>USD ${total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-green-600 mt-1">+{pointsEarned} points on this order</p>
              </div>

              {/* Mock card input */}
              <div className="mb-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Card details (test mode)
                </p>
                <input
                  readOnly
                  value="4242 4242 4242 4242"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50"
                />
                <div className="flex gap-2">
                  <input
                    readOnly
                    value="12/29"
                    className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50"
                  />
                  <input
                    readOnly
                    value="100"
                    className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-400">Stripe test mode — no real charge</p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                  {error}
                </p>
              )}

              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60"
              >
                {processing ? 'Processing...' : `Pay USD $${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartItemRow({
  item,
  onRemove,
  onQty,
}: {
  item: CartProduct | CartBooking;
  onRemove: () => void;
  onQty: (delta: number) => void;
}) {
  if (item.type === 'product') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center text-2xl shrink-0">
          🏓
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{item.product.name}</p>
          <p className="text-sm text-gray-500">{item.product.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQty(-1)}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
          <button
            onClick={() => onQty(1)}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <p className="font-bold text-green-700 w-20 text-right">
          ${(item.product.price * item.quantity).toFixed(2)}
        </p>
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
      <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center text-2xl shrink-0">
        🏟️
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{item.courtName}</p>
        <p className="text-sm text-gray-500">
          {item.date} &bull; {item.timeLabel}
        </p>
      </div>
      <p className="font-bold text-green-700 w-20 text-right">${item.price.toFixed(2)}</p>
      <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors">
        <Trash2 size={18} />
      </button>
    </div>
  );
}
