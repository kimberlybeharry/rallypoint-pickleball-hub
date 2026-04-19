import { getProductById } from '@/lib/actions/products';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AddToCartButton from './_components/AddToCartButton';

const CATEGORY_COLOUR: Record<string, string> = {
  Paddles: 'bg-green-50 text-green-700',
  Balls: 'bg-blue-50 text-blue-700',
  Bags: 'bg-amber-50 text-amber-700',
  Footwear: 'bg-purple-50 text-purple-700',
  Apparel: 'bg-pink-50 text-pink-700',
};

const SKILL_COLOURS: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-blue-100 text-blue-700',
  Advanced: 'bg-purple-100 text-purple-700',
  'All levels': 'bg-gray-100 text-gray-700',
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const colourClass = CATEGORY_COLOUR[product.category] ?? 'bg-green-50 text-green-700';
  const skillClass = product.skillLevel
    ? (SKILL_COLOURS[product.skillLevel] ?? 'bg-gray-100 text-gray-700')
    : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link
        href="/store"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8"
      >
        <ArrowLeft size={14} /> Back to Store
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Product image placeholder */}
        <div
          className={`rounded-2xl h-80 flex items-center justify-center text-7xl font-black ${colourClass}`}
        >
          {product.category.charAt(0)}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4">
          <div>
            {product.badge && (
              <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
                {product.badge}
              </span>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{product.category}</p>
          </div>

          <p className="text-3xl font-extrabold text-green-700">USD ${product.price.toFixed(2)}</p>

          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

          <div className="flex flex-wrap gap-2">
            {skillClass && product.skillLevel && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${skillClass}`}>
                {product.skillLevel}
              </span>
            )}
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="pt-2">
            <AddToCartButton product={product} />
          </div>

          <p className="text-xs text-gray-400">
            Earn {Math.floor(product.price)} points with this purchase. Free local delivery on
            orders over $100 USD.
          </p>
        </div>
      </div>
    </div>
  );
}
