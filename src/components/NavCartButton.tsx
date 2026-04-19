'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function NavCartButton() {
  const { count } = useCart();
  return (
    <Link
      href="/checkout"
      className="relative p-2 text-gray-600 hover:text-green-700 transition-colors"
    >
      <ShoppingCart size={22} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
