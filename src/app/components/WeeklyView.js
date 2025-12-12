"use client";

import { addMinutes, addDays, format, startOfWeek } from "date-fns";
import React from "react";

const SLOT_INTERVAL_MINUTES = 15;
const START_HOUR = 8;
const END_HOUR = 24;

const roomColors = {
  "Conference A": "bg-blue-400",
  "Conference B": "bg-green-400",
  "Meeting A": "bg-purple-400",
  "Meeting B": "bg-yellow-400",
};

export default function WeeklyView({ weekStart, onPrevWeek, onNextWeek, bookings = [], onSlotClick }) {
  const week = startOfWeek(weekStart, { weekStartsOn: 1 });
  const days = [...Array(7)].map((_, i) => addDays(week, i));

  const HOURS = Array.from(
    { length: (END_HOUR - START_HOUR) * (60 / SLOT_INTERVAL_MINUTES) },
    (_, i) => i * SLOT_INTERVAL_MINUTES
  );

  const getBookingAtSlot = (dayIndex, slotIndex) => {
    const dateStr = format(days[dayIndex], "yyyy-MM-dd");
    return bookings.find(
      (b) =>
        b.date === dateStr &&
        slotIndex >= b.start_index &&
        slotIndex <= b.end_index
    );
  };

  return (
    <div className="rounded-xl p-4 bg-(--color-glass-bg) border border-(--color-glass-border) backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={onPrevWeek} className="btn-glass">← Prev Week</button>
        <h2 className="text-xl font-semibold text-black">
          {format(week, "dd-MM-yyyy")} &ndash; {format(addDays(week, 6), "dd-MM-yyyy")}
        </h2>
        <button onClick={onNextWeek} className="btn-glass">Next Week →</button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1">
        {/* Day headers */}
        <div></div>
        {days.map((day) => (
          <div key={day} className="text-center py-2 font-semibold text-black">
            {format(day, "EEE dd-MM")}
          </div>
        ))}

        {/* Time slots */}
        {HOURS.map((slot, i) => (
          <React.Fragment key={i}>
            <div className="text-xs text-gray-700 p-1 text-center">
              {format(addMinutes(week, START_HOUR * 60 + slot), "HH:mm")}
            </div>
            {days.map((day, dayIndex) => {
              const booking = getBookingAtSlot(dayIndex, i);
              const isBooked = Boolean(booking);

              return (
                <button
                  key={`${dayIndex}-${i}`}
                  className={`h-10 m-0.5 rounded-md text-xs text-center transition shadow-md shadow-black/20
                    ${isBooked
                      ? `${roomColors[booking.room] || "bg-red-500"} text-white cursor-not-allowed`
                      : "bg-[rgba(255,255,255,0.2)] hover:bg-blue-500 hover:shadow-xl"
                    }
                  `}
                  disabled={isBooked}
                  onClick={() => onSlotClick(day)}
                  title={isBooked ? (booking.userIsOwner ? booking.title : booking.room) : "Available"}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
