'use client';

import { useState } from 'react';
import { cancelBooking } from '@/lib/actions/orders';

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm('Cancel this booking? 50 points will be deducted from your account.')) return;
    setPending(true);
    setError(null);
    const result = await cancelBooking(bookingId);
    setPending(false);
    if (result.success) {
      setDone(true);
    } else {
      setError(result.error ?? 'Could not cancel booking');
    }
  }

  if (done) {
    return <span className="text-xs text-red-600 font-medium">Cancelled</span>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={pending}
        className="text-xs text-red-600 border border-red-200 rounded-lg px-3 py-1 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        {pending ? 'Cancelling...' : 'Cancel booking'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
