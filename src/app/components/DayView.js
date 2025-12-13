"use client";

import { format, addMinutes } from "date-fns";

export default function DayView({ date, bookings = [], onSelectSlot }) {
  const START_HOUR = 8;
  const END_HOUR = 20;
  const INTERVAL = 15; // minutes

  const slots = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    for (let m = 0; m < 60; m += INTERVAL) {
      slots.push({ h, m });
    }
  }

  const isBooked = (slotMinutes) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookings.some(
      (b) =>
        b.date === dateStr &&
        slotMinutes >= b.start_minutes &&
        slotMinutes < b.end_minutes
    );
  };

  return (
    <div className="p-4 bg-(--color-glass-bg) border border-(--color-glass-border) rounded-2xl shadow-glass backdrop-blur-md">
      <h3 className="text-xl font-semibold text-center mb-4 text-black">
        {format(date, "EEEE, MMMM do")}
      </h3>

      <div className="grid grid-cols-[60px_1fr] gap-2">
        {/* Time column */}
        <div className="flex flex-col gap-2 text-gray-700 text-sm">
          {slots.map((s, idx) => (
            <div key={idx} className="text-center">
              {format(new Date(date.getFullYear(), date.getMonth(), date.getDate(), s.h, s.m), "HH:mm")}
            </div>
          ))}
        </div>

        {/* Slot column */}
        <div className="flex flex-col gap-2">
          {slots.map((s, idx) => {
            const minutes = s.h * 60 + s.m;
            const booked = isBooked(minutes);

            return (
              <button
                key={idx}
                onClick={() => !booked && onSelectSlot(date)}
                className={`
                  h-10 rounded-lg shadow-md transition
                  ${booked ? "bg-red-500 cursor-not-allowed text-white" : "bg-[rgba(255,255,255,0.2)] hover:bg-blue-50 hover:shadow-xl"}
                `}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
