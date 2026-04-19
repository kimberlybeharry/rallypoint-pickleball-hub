import { getCourts, getBookedSlotKeys } from '@/lib/actions/bookings';
import BookingGrid from './_components/BookingGrid';

export const dynamic = 'force-dynamic';

export default async function BookingPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [courts, bookedSet] = await Promise.all([getCourts(), getBookedSlotKeys(today)]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Court</h1>
      <p className="text-gray-500 mb-8">
        Select a date and reserve your slot. USD $15.00 per hour per court.
      </p>
      <BookingGrid courts={courts} bookedKeys={Array.from(bookedSet)} />
    </div>
  );
}
