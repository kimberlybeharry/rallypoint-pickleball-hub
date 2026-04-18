"use client";

import { useState } from "react";
import { PRODUCTS, type Category } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart, Check } from "lucide-react";

const CATEGORIES: ("All" | Category)[] = ["All", "Paddles", "Balls", "Bags", "Footwear", "Apparel"];

const CATEGORY_EMOJI: Record<string, string> = {
  Paddles: "🏓",
  Balls: "⚪",
  Bags: "🎒",
  Footwear: "👟",
  Apparel: "👕",
};

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState<"All" | Category>("All");
  const [search, setSearch] = useState("");
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const { addProduct } = useCart();

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function handleAdd(productId: string) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    addProduct(product);
    setAdded((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [productId]: false })), 1500);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Equipment Store</h1>
      <p className="text-gray-500 mb-8">Paddles, balls, bags and more — free local delivery on orders over $100 USD.</p>

      {/* Search + filter row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-green-700 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:border-green-500"
              }`}
            >
              {cat !== "All" && CATEGORY_EMOJI[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No products match your search.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
              {/* Product image placeholder */}
              <div className="h-44 bg-green-50 flex items-center justify-center text-6xl">
                {CATEGORY_EMOJI[product.category] ?? "🏓"}
              </div>
              <div className="p-5 flex flex-col flex-1 gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {product.badge && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                        {product.badge}
                      </span>
                    )}
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                  </div>
                  <span className="font-bold text-green-700 whitespace-nowrap">
                    USD ${product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm flex-1">{product.description}</p>
                <button
                  onClick={() => handleAdd(product.id)}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    added[product.id]
                      ? "bg-green-100 text-green-700"
                      : "bg-green-700 text-white hover:bg-green-800"
                  }`}
                >
                  {added[product.id] ? (
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
    </div>
  );
}
