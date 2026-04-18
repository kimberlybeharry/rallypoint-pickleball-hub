"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/store", label: "Shop" },
  { href: "/booking", label: "Book Courts" },
  { href: "/dashboard", label: "My Account" },
];

export default function Nav() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-green-700 font-bold text-xl tracking-tight">
          RallyPoint
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-green-700"
                  : "text-gray-600 hover:text-green-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/checkout" className="relative p-2 text-gray-600 hover:text-green-700 transition-colors">
          <ShoppingCart size={22} />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>
      </div>
      {/* Mobile nav */}
      <div className="sm:hidden border-t border-gray-100 bg-white">
        <div className="flex overflow-x-auto px-4 py-2 gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === link.href ? "text-green-700" : "text-gray-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
