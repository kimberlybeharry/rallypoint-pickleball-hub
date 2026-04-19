'use client';

import { useState, useMemo, useTransition } from 'react';
import { useCart } from '@/lib/cart-context';
import { holdSlot } from '@/lib/actions/bookings';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';

interface Court {
  id: string;
  name: string;
}

const TIME_SLOTS = [
  { time: '07:00', label: '7:00 AM' },
  { time: '08:00', label: '8:00 AM' },
  { time: '09:00', label: '9:00 AM' },
  { time: '10:00', label: '10:00 AM' },
  { time: '11:00', label: '11:00 AM' },
  { time: '12:00', label: '12:00 PM' },
  { time: '13:00', label: '1:00 PM' },
  { time: '14:00', label: '2:00 PM' },
  { time: '15:00', label: '3:00 PM' },
  { time: '16:00', label: '4:00 PM' },
  { time: '17:00', label: '5:00 PM' },
  { time: '18:00', label: '6:00 PM' },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(anchor: Date): Date[] {
  const start = new Date(anchor);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function BookingGrid({
  courts,
  bookedKeys,
}: {
  courts: Court[];
  bookedKeys: string[];
}) {
  const bookedSet = new Set(bookedKeys);
  const today = useMemo(() => new Date(), []);
  const [anchor, setAnchor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(today));
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [holding, setHolding] = useState<Record<string, boolean>>({});
  const [selectedCourt, setSelectedCourt] = useState<string>(() => courts[0]?.id ?? '');
  const [, startTransition] = useTransition();
  const { addBooking, items } = useCart();

  const weekDates = useMemo(() => getWeekDates(anchor), [anchor]);

  function slotKey(courtId: string, time: string) {
    return `booking-${courtId}-${selectedDate}-${time}`;
  }

  function isBooked(courtId: string, time: string) {
    return bookedSet.has(`${courtId}|${time}`);
  }

  function isInCart(courtId: string, time: string) {
    const key = slotKey(courtId, time);
    return items.some((i) => i.id === key);
  }

  function handleBook(courtId: string, courtName: string, time: string, timeLabel: string) {
    if (isBooked(courtId, time) || isInCart(courtId, time)) return;
    const key = slotKey(courtId, time);
    setHolding((prev) => ({ ...prev, [key]: true }));
    startTransition(async () => {
      try {
        const slot = await holdSlot(courtId, selectedDate, time);
        const slotId = slot?.id;
        addBooking(courtId, courtName, selectedDate, time, timeLabel, slotId);
        setAdded((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => setAdded((prev) => ({ ...prev, [key]: false })), 1500);
      } finally {
        setHolding((prev) => ({ ...prev, [key]: false }));
      }
    });
  }

  const selectedDateObj = weekDates.find((d) => formatDate(d) === selectedDate);
  const displayDate = selectedDateObj
    ? selectedDateObj.toLocaleDateString('en-TT', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : selectedDate;

  return (
    <>
      {/* Week picker */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              const d = new Date(anchor);
              d.setDate(d.getDate() - 7);
              setAnchor(d);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Previous week"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-gray-700 text-sm">
            {weekDates[0].toLocaleDateString('en-TT', { month: 'short', day: 'numeric' })} &ndash;{' '}
            {weekDates[6].toLocaleDateString('en-TT', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <button
            type="button"
            onClick={() => {
              const d = new Date(anchor);
              d.setDate(d.getDate() + 7);
              setAnchor(d);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Next week"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((d, i) => {
            const key = formatDate(d);
            const isSelected = key === selectedDate;
            const isPast = d < new Date(today.toDateString());
            return (
              <button
                key={key}
                type="button"
                onClick={() => !isPast && setSelectedDate(key)}
                disabled={isPast}
                className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-green-700 text-white'
                    : isPast
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'hover:bg-green-50 text-gray-700'
                }`}
              >
                <span className="uppercase">{DAY_LABELS[i]}</span>
                <span className="text-base font-bold">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots grid */}
      <h2 className="font-semibold text-gray-800 mb-4">{displayDate}</h2>

      {/* Mobile: court tabs + vertical slot list */}
      <div className="sm:hidden">
        <div className="flex gap-2 mb-5">
          {courts.map((court) => (
            <button
              key={court.id}
              type="button"
              onClick={() => setSelectedCourt(court.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                selectedCourt === court.id
                  ? 'bg-green-700 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:border-green-500'
              }`}
            >
              {court.name}
            </button>
          ))}
        </div>
        <div className="divide-y divide-gray-100">
          {TIME_SLOTS.map((slot) => {
            const court = courts.find((c) => c.id === selectedCourt);
            if (!court) return null;
            const booked = isBooked(court.id, slot.time);
            const inCart = isInCart(court.id, slot.time);
            const justAdded = added[slotKey(court.id, slot.time)];
            const isHolding = holding[slotKey(court.id, slot.time)];
            return (
              <div key={slot.time} className="flex items-center gap-4 py-3">
                <span className="text-sm font-medium text-gray-600 w-20 shrink-0">
                  {slot.label}
                </span>
                <button
                  type="button"
                  onClick={() => handleBook(court.id, court.name, slot.time, slot.label)}
                  disabled={booked || inCart || isHolding}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    booked
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : inCart || justAdded
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : isHolding
                          ? 'bg-green-50 text-green-500 cursor-wait'
                          : 'bg-green-50 text-green-700 active:bg-green-700 active:text-white'
                  }`}
                >
                  {booked ? (
                    'Booked'
                  ) : inCart ? (
                    <span className="flex items-center justify-center gap-1">
                      <Check size={14} /> In cart
                    </span>
                  ) : isHolding ? (
                    <span className="flex items-center justify-center gap-1">
                      <Loader2 size={14} className="animate-spin" /> Holding...
                    </span>
                  ) : (
                    '$15 — Book'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: full cross-court table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-2 pr-4 w-28">
                Time
              </th>
              {courts.map((court) => (
                <th
                  key={court.id}
                  className="text-center text-xs font-semibold text-gray-500 uppercase py-2 px-2"
                >
                  {court.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot.time} className="border-t border-gray-100">
                <td className="text-sm text-gray-600 py-2 pr-4 font-medium">{slot.label}</td>
                {courts.map((court) => {
                  const booked = isBooked(court.id, slot.time);
                  const inCart = isInCart(court.id, slot.time);
                  const justAdded = added[slotKey(court.id, slot.time)];
                  const isHolding = holding[slotKey(court.id, slot.time)];
                  return (
                    <td key={court.id} className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleBook(court.id, court.name, slot.time, slot.label)}
                        disabled={booked || inCart || isHolding}
                        className={`w-full max-w-[120px] mx-auto py-2 rounded-lg text-xs font-semibold transition-colors ${
                          booked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : inCart || justAdded
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : isHolding
                                ? 'bg-green-50 text-green-500 cursor-wait'
                                : 'bg-green-50 text-green-700 hover:bg-green-700 hover:text-white'
                        }`}
                      >
                        {booked ? (
                          'Booked'
                        ) : inCart ? (
                          <span className="flex items-center justify-center gap-1">
                            <Check size={12} /> In cart
                          </span>
                        ) : isHolding ? (
                          <span className="flex items-center justify-center gap-1">
                            <Loader2 size={12} className="animate-spin" /> Holding...
                          </span>
                        ) : (
                          '$15 — Book'
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-green-50 border border-green-200" />{' '}
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-green-100 border border-green-300" /> In
          your cart
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-gray-100" /> Already booked
        </span>
      </div>
    </>
  );
}
