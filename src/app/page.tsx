import Link from 'next/link';
import { Calendar, ShoppingBag, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <p className="text-green-200 text-sm font-semibold uppercase tracking-widest mb-4">
            Trinidad and Tobago&apos;s Pickleball Platform
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            One platform to book, shop, and reward your game.
          </h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto mb-8">
            Reserve a court in seconds, pick up your gear, and earn points on every booking and
            purchase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="bg-white text-green-700 font-bold px-8 py-3 rounded-lg hover:bg-green-50 transition-colors"
            >
              Book a Court
            </Link>
            <Link
              href="/store"
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Shop Equipment
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
          Everything you need, in one place
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Calendar className="text-green-600" size={28} />}
            title="Book Courts"
            description="Check real-time availability across 3 courts and reserve your slot with a single click. No phone calls, no double-bookings."
            href="/booking"
            cta="View Courts"
          />
          <FeatureCard
            icon={<ShoppingBag className="text-green-600" size={28} />}
            title="Shop Gear"
            description="Paddles, balls, bags, shoes and apparel — built for the T&T pickleball community. Add to your cart alongside a court booking."
            href="/store"
            cta="Browse Store"
          />
          <FeatureCard
            icon={<Star className="text-green-600" size={28} />}
            title="Earn Rewards"
            description="Earn points on every booking and purchase. Unlock Silver and Gold tier benefits and get personalised recommendations."
            href="/dashboard"
            cta="My Points"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-b border-gray-200 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Browse and add',
                body: 'Choose a court time slot or equipment item and add it to your cart.',
              },
              {
                step: '2',
                title: 'Pay once',
                body: 'Complete a single checkout for all items — no juggling separate platforms.',
              },
              {
                step: '3',
                title: 'Play and earn',
                body: 'Earn points automatically on every transaction. Silver at 200 pts, Gold at 500 pts.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-extrabold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500 text-sm mb-2">Ready to play?</p>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Book your first court today.</h2>
        <Link
          href="/booking"
          className="bg-green-700 text-white font-bold px-10 py-3 rounded-lg hover:bg-green-800 transition-colors"
        >
          See Available Slots
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
      <Link href={href} className="mt-auto text-green-700 font-semibold text-sm hover:underline">
        {cta} &rarr;
      </Link>
    </div>
  );
}
