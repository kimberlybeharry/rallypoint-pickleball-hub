'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function ReferralCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback for environments where clipboard API is unavailable
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-bold text-gray-900 mb-1">Refer a Friend</h2>
      <p className="text-xs text-gray-400 mb-4">
        Share your code and earn 250 points when your friend makes their first purchase.
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <span className="font-mono font-bold text-green-800 tracking-widest text-sm">{code}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
            copied ? 'bg-green-100 text-green-700' : 'bg-green-700 text-white hover:bg-green-800'
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
