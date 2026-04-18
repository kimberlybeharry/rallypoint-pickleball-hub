"use client";

import { useState, useMemo } from "react";
import { COURTS, TIME_SLOTS, PRE_BOOKED } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

function getWeekDates(anchor: Date): Date[] {
  const start = new Date(anchor);
  const day = start.getDay(); // 0=Sun
  start.setDate(start.getDate() - day); // go to Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BookingPage() {
  const today = useMemo(() => new Date(), []);
  const [anchor, setAnchor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(today));
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const { addBooking, items } = useCart();

  const weekDates = useMemo(() => getWeekDates(anchor), [anchor]);

  function prevWeek() {
    const d = new Date(anchor);
    d.setDate(d.getDate() - 7);
    setAnchor(d);
  }

  function nextWeek() {
    const d = new Date(anchor);
    d.setDate(d.getDate() + 7);
    setAnchor(d);
  }

  function slotKey(courtId: string, time: string) {
    return `booking-${courtId}-${selectedDate}-${time}`;
  }

  function isPreBooked(courtId: string, time: string) {
    return PRE_BOOKED.has(`${courtId}|${time}`);
  }

  function isInCart(courtId: string, time: string) {
    const key = slotKey(courtId, time);
    return items.some((i) => i.id === key);
  }

  function handleBook(courtId: string, courtName: string, time: string, timeLabel: string) {
    if (isPreBooked(courtId, time) || isInCart(courtId, time)) return;
    addBooking(courtId, courtName, selectedDate, time, timeLabel);
    const key = slotKey(courtId, time);
    setAdded((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [key]: false })), 1500);
  }

  const selectedDateObj = weekDates.find((d) => formatDate(d) === selectedDate);
  const displayDate = selectedDateObj
    ? selectedDateObj.toLocaleDateString("en-TT", { weekday: "long", month: "long", day: "numeric" })
    : selectedDate;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Court</h1>
      <p className="text-gray-500 mb-8">
        Select a date and reserve your slot. USD $15.00 per hour per court.
      </p>

      {/* Week picker */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevWeek}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Previous week"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-gray-700 text-sm">
            {weekDates[0].toLocaleDateString("en-TT", { month: "short", day: "numeric" })} &ndash;{" "}
            {weekDates[6].toLocaleDateString("en-TT", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <button
            onClick={nextWeek}
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
                onClick={() => !isPast && setSelectedDate(key)}
                disabled={isPast}
                className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-green-700 text-white"
                    : isPast
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-green-50 text-gray-700"
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-2 pr-4 w-28">Time</th>
              {COURTS.map((court) => (
                <th key={court.id} className="text-center text-xs font-semibold text-gray-500 uppercase py-2 px-2">
                  {court.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot.time} className="border-t border-gray-100">
                <td className="text-sm text-gray-600 py-2 pr-4 font-medium">{slot.label}</td>
                {COURTS.map((court) => {
                  const pre = isPreBooked(court.id, slot.time);
                  const inCart = isInCart(court.id, slot.time);
                  const justAdded = added[slotKey(court.id, slot.time)];
                  return (
                    <td key={court.id} className="py-2 px-2 text-center">
                      <button
                        onClick={() => handleBook(court.id, court.name, slot.time, slot.label)}
                        disabled={pre || inCart}
                        className={`w-full max-w-[120px] mx-auto py-2 rounded-lg text-xs font-semibold transition-colors ${
                          pre
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : inCart || justAdded
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-green-50 text-green-700 hover:bg-green-700 hover:text-white"
                        }`}
                      >
                        {pre ? "Booked" : inCart ? (
                          <span className="flex items-center justify-center gap-1"><Check size={12} /> In cart</span>
                        ) : "$15 — Book"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-4 rounded bg-green-50 border border-green-200" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-4 rounded bg-green-100 border border-green-300" /> In your cart</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-4 rounded bg-gray-100" /> Already booked</span>
      </div>
    </div>
  );
}
