'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { ShoppingCart, Check } from 'lucide-react';
import type { Product } from '@/generated/prisma';

type Category = 'All' | 'Paddles' | 'Balls' | 'Bags' | 'Footwear' | 'Apparel';
type SkillFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

const CATEGORIES: Category[] = ['All', 'Paddles', 'Balls', 'Bags', 'Footwear', 'Apparel'];
const SKILL_LEVELS: SkillFilter[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const CATEGORY_EMOJI: Record<string, string> = {
  Paddles: 'P',
  Balls: 'B',
  Bags: 'C',
  Footwear: 'S',
  Apparel: 'A',
};

const CATEGORY_COLOR: Record<string, string> = {
  Paddles: 'bg-green-50 text-green-700',
  Balls: 'bg-blue-50 text-blue-700',
  Bags: 'bg-amber-50 text-amber-700',
  Footwear: 'bg-purple-50 text-purple-700',
  Apparel: 'bg-pink-50 text-pink-700',
};

export default function ProductGrid({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [activeSkill, setActiveSkill] = useState<SkillFilter>('All');
  const [search, setSearch] = useState('');
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const { addProduct } = useCart();

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSkill =
      activeSkill === 'All' || (p.skillLevel != null && p.skillLevel === activeSkill);
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSkill && matchSearch;
  });

  function handleAdd(product: Product) {
    // Map DB Product to cart-context's Product type
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category as 'Paddles' | 'Balls' | 'Bags' | 'Footwear' | 'Apparel',
      badge: product.badge ?? undefined,
    };
    addProduct(cartProduct);
    setAdded((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [product.id]: false })), 1500);
  }

  return (
    <>
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-green-700 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:border-green-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 font-medium">Skill level:</span>
          {SKILL_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setActiveSkill(level)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeSkill === level
                  ? 'bg-gray-800 text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No products match your search.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col"
            >
              <Link href={`/store/${product.id}`}>
                <div
                  className={`h-44 flex items-center justify-center text-4xl font-bold hover:opacity-90 transition-opacity cursor-pointer ${
                    CATEGORY_COLOR[product.category] ?? 'bg-green-50 text-green-700'
                  }`}
                >
                  {CATEGORY_EMOJI[product.category] ?? 'P'}
                </div>
              </Link>
              <div className="p-5 flex flex-col flex-1 gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {product.badge && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                        {product.badge}
                      </span>
                    )}
                    <Link href={`/store/${product.id}`}>
                      <h3 className="font-bold text-gray-900 hover:text-green-700 transition-colors cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                  <span className="font-bold text-green-700 whitespace-nowrap">
                    USD ${product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm flex-1">{product.description}</p>
                {product.skillLevel && (
                  <span className="self-start text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {product.skillLevel}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  disabled={product.stock === 0}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    product.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : added[product.id]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-green-700 text-white hover:bg-green-800'
                  }`}
                >
                  {product.stock === 0 ? (
                    'Out of Stock'
                  ) : added[product.id] ? (
                    <>
                      <Check size={16} /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
