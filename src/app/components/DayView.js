"use client";

import { format } from "date-fns";

export default function DayView({ date, bookings, onSelectSlot }) {
  const START = 8;
  const END = 20;
  const INTERVAL = 15;

  const slots = [];
  for (let h = START; h <= END; h++) {
    for (let m = 0; m < 60; m += INTERVAL) {
      slots.push({ h, m });
    }
  }

  return (
    <div className="px-6 py-4 w-full">

      <h2 className="text-2xl font-semibold mb-4">
        {format(date, "EEEE, MMMM d")}
      </h2>

      <div className="grid grid-cols-6 gap-2">
        {/* time column */}
        <div className="col-span-1 flex flex-col gap-3">
          {slots.map((s, i) => (
            <div key={i} className="text-gray-500 text-sm">
              {format(new Date(2025, 0, 1, s.h, s.m), "HH:mm")}
            </div>
          ))}
        </div>

        {/* main timeline */}
        <div className="col-span-5 flex flex-col gap-3">
          {slots.map((s, idx) => {
            const minutes = s.h * 60 + s.m;
            const isBooked = bookings.some(
              (b) =>
                b.date === format(date, "yyyy-MM-dd") &&
                minutes >= b.start_minutes &&
                minutes < b.end_minutes
            );

            return (
              <button
                key={idx}
                onClick={() =>
                  onSelectSlot(date, new Date(date.getFullYear(), date.getMonth(), date.getDate(), s.h, s.m))
                }
                className={`h-14 rounded-xl shadow-sm bg-white transition ${
                  isBooked ? "bg-blue-200 cursor-not-allowed" : "hover:bg-blue-50"
                }`}
              ></button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
