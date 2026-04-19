import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/auth';
import { Shield } from 'lucide-react';
import NavUserMenu from '@/components/NavUserMenu';
import NavCartButton from '@/components/NavCartButton';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/store', label: 'Shop' },
  { href: '/booking', label: 'Book Courts' },
];

export default async function Nav() {
  const session = await auth();
  const user = session?.user as
    | { name?: string | null; email?: string | null; image?: string | null; role?: string }
    | undefined;
  const isAuthenticated = !!session;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
          <Image
            src="/logo.png"
            alt="RallyPoint"
            width={32}
            height={32}
            className="rounded-md w-8 h-auto"
          />
          <span className="text-gray-900">RallyPoint</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
            >
              My Account
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors flex items-center gap-1"
            >
              <Shield size={14} />
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <NavCartButton />
          {isAuthenticated ? (
            <NavUserMenu
              name={user?.name}
              email={user?.email}
              image={user?.image}
              isAdmin={isAdmin}
            />
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors px-3 py-1.5"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                Join free
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="sm:hidden border-t border-gray-100 bg-white">
        <div className="flex overflow-x-auto px-4 py-2 gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium whitespace-nowrap text-gray-500 hover:text-green-700"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium whitespace-nowrap text-gray-500 hover:text-green-700"
            >
              My Account
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium whitespace-nowrap text-gray-500 hover:text-green-700"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium whitespace-nowrap text-green-600 hover:text-green-700"
              >
                Join free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
