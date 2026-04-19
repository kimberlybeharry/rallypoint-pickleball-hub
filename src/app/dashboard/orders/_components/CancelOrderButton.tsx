'use client';

import { useState } from 'react';
import { cancelOrder } from '@/lib/actions/orders';

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [state, setState] = useState<'idle' | 'confirming' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (state === 'done') {
    return <span className="text-xs text-red-500 font-medium">Cancelled</span>;
  }

  if (state === 'confirming') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">Cancel this order?</span>
        <button
          onClick={async () => {
            setState('loading');
            const result = await cancelOrder(orderId);
            if (result.success) {
              setState('done');
            } else {
              setError(result.error ?? 'Something went wrong');
              setState('idle');
            }
          }}
          className="text-xs font-semibold text-red-600 hover:text-red-700"
        >
          Yes, cancel
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
      className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {state === 'loading' ? 'Cancelling…' : 'Cancel order'}
    </button>
  );
}
