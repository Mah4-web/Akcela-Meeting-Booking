"use client";

import { startOfWeek, addMinutes, addDays, format } from "date-fns";
import React from "react";

const SLOT_INTERVAL_MINUTES = 15;
const START_HOUR = 8;
const END_HOUR = 24;

export default function WeeklyView({ weekStart, onPrevWeek, onNextWeek, bookings }) {
  const week = startOfWeek(weekStart, { weekStartsOn: 1 }); // Monday
  const days = [...Array(7)].map((_, i) => addDays(week, i));

  // Generate slots from 08:00 to END_HOUR
  const HOURS = Array.from(
    { length: (END_HOUR - START_HOUR) * (60 / SLOT_INTERVAL_MINUTES) },
    (_, i) => i * SLOT_INTERVAL_MINUTES
  );

  const isBooked = (dayIndex, slotIndex) => {
    if (!bookings) return false;
    const dateStr = format(days[dayIndex], "yyyy-MM-dd");
    return bookings.some(
      (b) =>
        b.date === dateStr && slotIndex >= b.start_index && slotIndex <= b.end_index
    );
  };

  return (
    <div className="rounded-xl p-4 bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.3)] backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onPrevWeek}
          className="px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.3)] backdrop-blur-md shadow-md hover:shadow-xl transition"
        >
          ← Prev Week
        </button>

        <h2 className="text-xl font-semibold text-black">
          {format(week, "MMM d")} &ndash; {format(addDays(week, 6), "MMM d")}
        </h2>

        <button
          onClick={onNextWeek}
          className="px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.3)] backdrop-blur-md shadow-md hover:shadow-xl transition"
        >
          Next Week →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1">
        {/* Day Headers */}
        <div></div>
        {days.map((day) => (
          <div key={day} className="text-center py-2 font-semibold text-black">
            {format(day, "EEE dd")}
          </div>
        ))}

        {/* Time Slots */}
        {HOURS.map((slot, i) => (
          <React.Fragment key={i}>
            {/* Time Column */}
            <div className="text-xs text-gray-700 p-1 text-center">
              {format(addMinutes(week, START_HOUR * 60 + slot), "HH:mm")}
            </div>

            {/* 7 Days Slots */}
            {days.map((day, dayIndex) => {
              const booked = isBooked(dayIndex, i);

              return (
                <button
                  key={dayIndex + "-" + i}
                  className={`h-10 m-0.5 rounded-md text-xs text-center transition
                    shadow-md shadow-black/20
                    ${
                      booked
                        ? "bg-red-500 text-white cursor-not-allowed"
                        : "bg-[rgba(255,255,255,0.2)] hover:bg-blue-500 hover:shadow-xl"
                    }
                  `}
                  disabled={booked}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
