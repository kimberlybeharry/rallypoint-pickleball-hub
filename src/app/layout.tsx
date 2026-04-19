import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import Nav from '@/components/Nav';
import { SessionProvider } from 'next-auth/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RallyPoint Pickleball Hub',
  description:
    "Book courts, shop gear, and earn rewards — Trinidad and Tobago's pickleball platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <CartProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-400">
            RallyPoint Pickleball Hub &mdash; Trinidad and Tobago &mdash; Prototype (AIT Assignment
            2)
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
