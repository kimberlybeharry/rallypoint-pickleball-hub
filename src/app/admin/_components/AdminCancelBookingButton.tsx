'use client';

import { useState } from 'react';
import { adminCancelBooking } from '@/lib/actions/admin';

export default function AdminCancelBookingButton({ bookingId }: { bookingId: string }) {
  const [state, setState] = useState<'idle' | 'confirming' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (state === 'done') {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600">
        CANCELLED
      </span>
    );
  }

  if (state === 'confirming') {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={async () => {
            setState('loading');
            const result = await adminCancelBooking(bookingId);
            if (result.success) {
              setState('done');
            } else {
              setError(result.error ?? 'Error');
              setState('idle');
            }
          }}
          className="text-xs font-semibold text-red-600 hover:text-red-700"
        >
          Confirm
        </button>
        <button
          onClick={() => setState('idle')}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          No
        </button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setState('confirming')}
      disabled={state === 'loading'}
      className="text-xs font-medium text-red-400 hover:text-red-600 shrink-0 ml-2 disabled:opacity-50"
    >
      {state === 'loading' ? '…' : 'Cancel'}
    </button>
  );
}
