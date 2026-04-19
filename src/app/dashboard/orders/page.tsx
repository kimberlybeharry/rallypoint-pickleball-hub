import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getHistory } from '@/lib/actions/orders';
import Link from 'next/link';
import { ShoppingBag, Calendar, ArrowLeft } from 'lucide-react';
import CancelBookingButton from './_components/CancelBookingButton';
import CancelOrderButton from './_components/CancelOrderButton';

const STATUS_COLOURS: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PAID: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-600',
  SHIPPED: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-blue-100 text-blue-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
  NO_SHOW: 'bg-red-100 text-red-600',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-TT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function OrderHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { items } = await getHistory();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Order &amp; Booking History</h1>
        <p className="text-gray-500 mt-1">All your past purchases and court reservations</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium mb-2">No history yet</p>
          <p className="text-sm">
            Your orders and bookings will appear here after your first purchase.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Link
              href="/store"
              className="bg-green-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-green-800 transition-colors text-sm"
            >
              Shop Equipment
            </Link>
            <Link
              href="/booking"
              className="border border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Book a Court
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) =>
            item.type === 'order' ? (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <ShoppingBag size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Equipment Order</p>
                      <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 text-sm">
                        ${item.totalAmount.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOURS[item.status] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    {(item.status === 'PAID' || item.status === 'PENDING') && (
                      <CancelOrderButton orderId={item.id} />
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-1">
                  {item.items.map((li, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-600">
                      <span>
                        {li.name}{' '}
                        {li.quantity > 1 && <span className="text-gray-400">x{li.quantity}</span>}
                      </span>
                      <span>${(li.unitPrice * li.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.courtName}</p>
                      <p className="text-xs text-gray-500">
                        {item.date} at {item.startTime}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">
                        ${item.totalAmount.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOURS[item.status] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    {item.status === 'CONFIRMED' && <CancelBookingButton bookingId={item.id} />}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
