import { getProducts } from '@/lib/actions/products';
import ProductGrid from './_components/ProductGrid';

// Products change rarely — cache for 1 hour, revalidate on demand
export const revalidate = 3600;

export default async function StorePage() {
  const products = await getProducts();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Equipment Store</h1>
      <p className="text-gray-500 mb-8">
        Paddles, balls, bags and more -- free local delivery on orders over $100 USD.
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
