'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { ShoppingCart, Check } from 'lucide-react';
import type { Product } from '@/generated/prisma';

export default function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const { addProduct } = useCart();

  function handleAdd() {
    addProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category as 'Paddles' | 'Balls' | 'Bags' | 'Footwear' | 'Apparel',
      badge: product.badge ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={product.stock === 0 || added}
      className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-colors ${
        product.stock === 0
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : added
            ? 'bg-green-100 text-green-700'
            : 'bg-green-700 text-white hover:bg-green-800'
      }`}
    >
      {product.stock === 0 ? (
        'Out of Stock'
      ) : added ? (
        <>
          <Check size={18} /> Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart size={18} /> Add to Cart
        </>
      )}
    </button>
  );
}
